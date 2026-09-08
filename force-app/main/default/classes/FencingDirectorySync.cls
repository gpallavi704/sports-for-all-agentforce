/**
 * Administrator-owned sync of public directory facts only.
 * No published record changes until every page has been validated.
 */
public without sharing class FencingDirectorySync implements Queueable, Database.AllowsCallouts {
    private static final String KEY = 'USA_FENCING';
    private String token;
    private Integer page;
    private Map<String, Fencing_Club_Directory__c> snapshot;
    public class DirectoryException extends Exception {}

    public FencingDirectorySync(String token, Integer page, Map<String, Fencing_Club_Directory__c> snapshot) {
        this.token = token;
        this.page = page;
        this.snapshot = snapshot;
    }

    public static Id startRefresh() {
        List<Club_Directory_Sync__c> controls = [
            SELECT Id, Status__c, Started_At__c FROM Club_Directory_Sync__c
            WHERE Directory_Key__c = :KEY WITH SYSTEM_MODE LIMIT 1 FOR UPDATE
        ];
        Club_Directory_Sync__c control = controls.isEmpty()
            ? new Club_Directory_Sync__c(Directory_Key__c = KEY) : controls[0];
        if (control.Status__c == 'RUNNING' && control.Started_At__c != null
            && control.Started_At__c > System.now().addHours(-2)) {
            throw new DirectoryException('A refresh is already running.');
        }
        String runToken = EncodingUtil.convertToHex(Crypto.generateAesKey(128));
        control.Status__c = 'RUNNING';
        control.Started_At__c = System.now();
        control.Run_Token__c = runToken;
        control.Error__c = null;
        upsert as system control Directory_Key__c;
        return System.enqueueJob(new FencingDirectorySync(runToken, 1, new Map<String, Fencing_Club_Directory__c>()));
    }

    public void execute(QueueableContext context) {
        try {
            // Limit each transaction's callouts and serialized state.
            Boolean more = true;
            for (Integer count = 0; count < 8 && more; count++) {
                if (page > 150 || snapshot.size() > 3000) throw new DirectoryException('Directory safety limit reached.');
                HttpRequest request = new HttpRequest();
                request.setEndpoint('https://member.usafencing.org/clubs?page=' + page);
                request.setMethod('GET');
                request.setHeader('Accept', 'application/json');
                request.setTimeout(10000);
                HttpResponse response = new Http().send(request);
                if (response.getStatusCode() != 200 || response.getBody().length() > 1500000)
                    throw new DirectoryException('Directory unavailable or response too large.');
                more = consumePage(response.getBody(), page, snapshot);
                page++;
            }
            Club_Directory_Sync__c control = [
                SELECT Id, Run_Token__c, Status__c, Record_Count__c FROM Club_Directory_Sync__c
                WHERE Directory_Key__c = :KEY WITH SYSTEM_MODE LIMIT 1 FOR UPDATE
            ];
            // A superseded job must never publish over a more recent refresh.
            if (control.Run_Token__c != token || control.Status__c != 'RUNNING') return;
            if (more) {
                System.enqueueJob(new FencingDirectorySync(token, page, snapshot));
            } else {
                publishSnapshot(snapshot, control);
            }
        } catch (Exception error) {
            markFailed(token, 'Refresh failed: ' + error.getTypeName());
        }
    }

    @TestVisible
    private static Boolean consumePage(String body, Integer expectedPage, Map<String, Fencing_Club_Directory__c> records) {
        Map<String, Object> root = (Map<String, Object>) JSON.deserializeUntyped(body);
        Map<String, Object> data = (Map<String, Object>) root.get('indexData');
        Map<String, Object> pages = (Map<String, Object>) data.get('pages');
        List<Object> models = (List<Object>) data.get('models');
        if (number(pages.get('current')) != expectedPage || models == null || models.isEmpty() || models.size() > 100
            || !(pages.get('hasMorePages') instanceof Boolean)) throw new DirectoryException('Invalid directory pagination.');
        Boolean more = (Boolean) pages.get('hasMorePages');
        if (more && number(pages.get('next')) != expectedPage + 1) throw new DirectoryException('Invalid next page.');
        for (Object model : models) {
            Fencing_Club_Directory__c club = normalize((Map<String, Object>) model);
            if (records.containsKey(club.Source_Id__c)) throw new DirectoryException('Duplicate directory ID.');
            records.put(club.Source_Id__c, club);
        }
        return more;
    }

    @TestVisible
    private static Fencing_Club_Directory__c normalize(Map<String, Object> row) {
        String sourceId = clean(row.get('id'), 40);
        String name = clean(row.get('name'), 255);
        Map<String, Object> routes = (Map<String, Object>) row.get('routes');
        String source = routes == null ? null : safeUrl(routes.get('show'), true);
        if (String.isBlank(sourceId) || !Pattern.matches('[0-9]+', sourceId) || String.isBlank(name) || source == null)
            throw new DirectoryException('Missing source identity.');
        String inactive = String.valueOf(row.get('inactive'));
        if (inactive != '0' && inactive != '1' && inactive != 'false' && inactive != 'true')
            throw new DirectoryException('Unrecognized active flag.');
        Fencing_Club_Directory__c club = new Fencing_Club_Directory__c(
            Source_Id__c = sourceId, Club_Name__c = name, Source_URL__c = source,
            Website__c = safeUrl(row.get('website'), false),
            Active__c = inactive == '0' || inactive == 'false', Para_Listed__c = false
        );
        Map<String, Object> address = (Map<String, Object>) row.get('publicAddress');
        if (address != null) {
            club.Street__c = clean(address.get('full_street_address'), 255);
            club.City__c = clean(address.get('city'), 100);
            club.State__c = clean(address.get('state'), 40);
            club.Postal_Code__c = clean(address.get('zip'), 20);
            club.Country__c = clean(address.get('country'), 40);
            Decimal lat = coordinate(address.get('lat'), 90);
            Decimal lng = coordinate(address.get('lng'), 180);
            if (lat != null && lng != null) {
                club.Location__Latitude__s = lat;
                club.Location__Longitude__s = lng;
            }
        }
        Set<String> weapons = new Set<String>();
        if (row.get('specialties') instanceof List<Object>) {
            for (Object weapon : (List<Object>) row.get('specialties')) {
                String value = String.valueOf(weapon);
                if (new Set<String>{'Foil','Epee','Saber','Para'}.contains(value)) weapons.add(value);
            }
        }
        List<String> sorted = new List<String>(weapons);
        sorted.sort();
        club.Weapons__c = String.join(sorted, ';');
        club.Para_Listed__c = weapons.contains('Para');
        Map<String, Object> division = (Map<String, Object>) row.get('division');
        if (division != null) club.Division__c = clean(division.get('label'), 255);
        return club;
    }

    @TestVisible
    private static void publishSnapshot(Map<String, Fencing_Club_Directory__c> records, Club_Directory_Sync__c control) {
        if (records.isEmpty() || records.size() > 3000
            || (control.Record_Count__c != null && records.size() < control.Record_Count__c * 0.5))
            throw new DirectoryException('Empty or unexpectedly small snapshot. Review before retrying.');
        Savepoint beforePublish = Database.setSavepoint();
        try {
            Datetime retrieved = System.now();
            List<Fencing_Club_Directory__c> incoming = records.values();
            for (Fencing_Club_Directory__c club : incoming) club.Last_Synced_At__c = retrieved;
            upsert as system incoming Source_Id__c;
            Set<String> ids = records.keySet();
            List<Fencing_Club_Directory__c> missing = [
                SELECT Id, Active__c FROM Fencing_Club_Directory__c
                WHERE Active__c = true AND Source_Id__c NOT IN :ids WITH SYSTEM_MODE
            ];
            for (Fencing_Club_Directory__c club : missing) club.Active__c = false;
            update as system missing;
            control.Status__c = 'SUCCEEDED';
            control.Completed_At__c = retrieved;
            control.Record_Count__c = records.size();
            control.Error__c = null;
            update as system control;
        } catch (Exception error) {
            Database.rollback(beforePublish);
            throw error;
        }
    }

    private static void markFailed(String runToken, String message) {
        List<Club_Directory_Sync__c> controls = [
            SELECT Id, Run_Token__c FROM Club_Directory_Sync__c WHERE Directory_Key__c = :KEY WITH SYSTEM_MODE LIMIT 1 FOR UPDATE
        ];
        if (!controls.isEmpty() && controls[0].Run_Token__c == runToken) {
            controls[0].Status__c = 'FAILED';
            controls[0].Error__c = message.left(255);
            update as system controls;
        }
    }

    public static String safeUrl(Object value, Boolean official) {
        String raw = value == null ? null : String.valueOf(value).trim();
        if (String.isBlank(raw) || raw.length() > 255 || Pattern.compile('[\\s<>]').matcher(raw).find()) return null;
        try {
            Url url = new Url(raw);
            if ((url.getProtocol() != 'https' && url.getProtocol() != 'http')
                || String.isBlank(url.getHost()) || url.getUserInfo() != null || url.getQuery() != null || url.getRef() != null)
                return null;
            if (official && (url.getProtocol() != 'https' || url.getHost() != 'member.usafencing.org'
                || !url.getPath().startsWith('/clubs/'))) return null;
            return raw;
        } catch (Exception error) { return null; }
    }
    private static String clean(Object value, Integer length) {
        return value == null ? null : String.valueOf(value).replaceAll('<[^>]*>', '').replaceAll('[\\r\\n\\t]', ' ').trim().left(length);
    }
    private static Integer number(Object value) { return Integer.valueOf(String.valueOf(value)); }
    private static Decimal coordinate(Object value, Integer bound) {
        if (value == null) return null;
        try {
            Decimal result = Decimal.valueOf(String.valueOf(value));
            return result >= -bound && result <= bound ? result : null;
        } catch (Exception error) { return null; }
    }
}
