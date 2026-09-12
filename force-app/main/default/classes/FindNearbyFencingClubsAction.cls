public with sharing class FindNearbyFencingClubsAction {
    private static final Set<Integer> RADII = new Set<Integer>{10,25,50,100};
    private static final Set<String> WEAPONS = new Set<String>{'Epee','Foil','Saber','Para'};
    private static Map<String, Location> centers = new Map<String, Location>();
    @TestVisible private static String lastFailure;
    public class Request {
        @InvocableVariable(description='Visitor-supplied five-digit US ZIP. Never invent one from a city.') public String location;
        @InvocableVariable(description='10, 25, 50 or 100 miles. Default 50; never silently widen.') public Integer radiusMiles;
        @InvocableVariable(description='Optional comma-separated Epee, Foil, Saber, Para. Multiple filters match any requested weapon.') public String weapons;
        @InvocableVariable(description='Result count 1 to 10; default 3.') public Integer resultLimit;
    }
    public class Response {
        @InvocableVariable public String status;
        @InvocableVariable public String message;
        @InvocableVariable public String resultsJson;
        @InvocableVariable(description='Canonical versioned JSON for Custom Connections and channel adapters. Validate before rendering.') public String structuredResultJson;
        @InvocableVariable public Integer radiusMiles;
        @InvocableVariable public Boolean hasMore;
    }
    @InvocableMethod(label='Find Nearby Fencing Clubs' description='Search synchronized public Salesforce club records by ZIP and geographic radius. Para is a directory tag, not verified accessibility. Read-only.' callout=true)
    public static List<Response> findClubs(List<Request> requests) {
        List<Response> answers = new List<Response>();
        if (requests == null) return answers;
        Map<String, Response> repeated = new Map<String, Response>();
        for (Request request : requests) {
            if (request == null || requests.size() > 5) {
                answers.add(answer('INVALID_INPUT','Provide at most five searches per invocation.',null));
                continue;
            }
            String key = JSON.serialize(request);
            if (!repeated.containsKey(key)) repeated.put(key, search(request));
            answers.add(repeated.get(key));
        }
        return answers;
    }
    private static Response search(Request request) {
        Integer radius = request.radiusMiles == null ? 50 : request.radiusMiles;
        Integer count = request.resultLimit == null ? 3 : request.resultLimit;
        if (!RADII.contains(radius) || count < 1 || count > 10)
            return answer('INVALID_INPUT','Choose 10, 25, 50 or 100 miles and 1 to 10 results.',radius);
        if (String.isBlank(request.location) || !Pattern.matches('[0-9]{5}',request.location.trim()))
            return answer('NEEDS_ZIP','What is your five-digit ZIP code? I use it to search nearby, rather than limiting results to the city name.',radius);
        Set<String> filters = new Set<String>();
        if (!String.isBlank(request.weapons)) {
            if (request.weapons.length() > 80) return answer('INVALID_INPUT','Use Epee, Foil, Saber or Para.',radius);
            for (String item : request.weapons.split(',')) {
                String found;
                for (String weapon : WEAPONS) if (weapon.equalsIgnoreCase(item.trim())) found = weapon;
                if (found == null) return answer('INVALID_INPUT','Use Epee, Foil, Saber or Para.',radius);
                filters.add(found);
            }
        }
        try {
            List<Fencing_Club_Directory__c> freshness = [
                SELECT Last_Synced_At__c FROM Fencing_Club_Directory__c
                WHERE Active__c = true WITH USER_MODE ORDER BY Last_Synced_At__c DESC NULLS LAST LIMIT 1
            ];
            if (freshness.isEmpty() || freshness[0].Last_Synced_At__c == null) return unavailable(radius);
            Datetime refreshed = freshness[0].Last_Synced_At__c;
            if (refreshed < System.now().addDays(-7))
                return answer('STALE_DIRECTORY','Club data is over seven days old. Check the official USA Fencing club finder for current listings.',radius);
            Location center = zipCenter(request.location.trim());
            if (center == null) return answer('LOCATION_UNAVAILABLE','I could not resolve that ZIP right now. Check the ZIP or use the official USA Fencing club finder.',radius);
            Map<String,Object> binds = new Map<String,Object>{
                'latitude'=>center.latitude,'longitude'=>center.longitude,'radius'=>radius,'limitCount'=>count+1
            };
            String query = 'SELECT Source_Id__c, Club_Name__c, Street__c, City__c, State__c, Postal_Code__c, Weapons__c, Para_Listed__c, '
                + 'Website__c, Source_URL__c, Location__Latitude__s, Location__Longitude__s, Last_Synced_At__c '
                + 'FROM Fencing_Club_Directory__c WHERE Active__c = true AND Country__c = \'US\' '
                + 'AND Location__Latitude__s != null AND Location__Longitude__s != null '
                + 'AND DISTANCE(Location__c, GEOLOCATION(:latitude,:longitude), \'mi\') < :radius';
            if (!filters.isEmpty()) {
                List<String> clauses = new List<String>();
                Integer index = 0;
                for (String filter : filters) {
                    String key = 'weapon' + index++;
                    clauses.add('Weapons__c LIKE :' + key);
                    binds.put(key, '%' + filter + '%');
                }
                query += ' AND (' + String.join(clauses,' OR ') + ')';
            }
            query += ' ORDER BY DISTANCE(Location__c,GEOLOCATION(:latitude,:longitude),\'mi\'), Club_Name__c LIMIT :limitCount';
            List<Fencing_Club_Directory__c> rows = Database.queryWithBinds(query,binds,AccessLevel.USER_MODE);
            Response response = answer(rows.isEmpty()?'NO_LISTINGS':'LISTINGS',
                'Approximate straight-line miles from the ZIP center, not driving distance. Para listed does not verify sessions, accessibility or equipment. Directory retrieved '
                + refreshed.formatGMT('yyyy-MM-dd HH:mm') + ' UTC.',radius);
            response.hasMore = rows.size() > count;
            if (refreshed < System.now().addHours(-48)) response.message += ' Refresh is delayed; confirm current details directly.';
            List<Object> clubs = new List<Object>();
            List<Object> legacyResults = new List<Object>();
            for (Integer i=0;i<rows.size() && i<count;i++) {
                Fencing_Club_Directory__c row = rows[i];
                Double miles = Location.getDistance(center,Location.newInstance(row.Location__Latitude__s,row.Location__Longitude__s),'mi');
                Decimal roundedMiles = Decimal.valueOf(String.valueOf(miles)).setScale(1);
                List<String> specialties = String.isBlank(row.Weapons__c)?new List<String>():row.Weapons__c.split(';');
                clubs.add(new Map<String,Object>{
                    'clubId'=>row.Source_Id__c,
                    'name'=>row.Club_Name__c,'city'=>row.City__c,'state'=>row.State__c,
                    'websiteUrl'=>row.Website__c,'directoryUrl'=>row.Source_URL__c,
                    'specialties'=>specialties,'paraListed'=>row.Para_Listed__c,'distanceMiles'=>roundedMiles,
                    'accessibilityNote'=>'Contact the club to confirm access and equipment.'
                });
                legacyResults.add(new Map<String,Object>{
                    'name'=>row.Club_Name__c,'street'=>row.Street__c,'city'=>row.City__c,'state'=>row.State__c,
                    'postalCode'=>row.Postal_Code__c,'website'=>row.Website__c,'sourceUrl'=>row.Source_URL__c,
                    'weapons'=>specialties,'paraListed'=>row.Para_Listed__c,'distanceMiles'=>roundedMiles,
                    'distanceType'=>'Approximate straight-line from ZIP center','radiusMiles'=>radius,
                    'sourceRetrievedAt'=>row.Last_Synced_At__c,'accessibility'=>'Unknown; confirm with club',
                    'sessionsAndEquipment'=>'Unknown; confirm with club'
                });
            }
            response.resultsJson = JSON.serialize(legacyResults);
            response.structuredResultJson = structuredResult(response,clubs,refreshed);
            return response;
        } catch (Exception error) {
            if (Test.isRunningTest()) lastFailure = error.getMessage();
            return unavailable(radius);
        }
    }
    private static Location zipCenter(String zip) {
        if (centers.containsKey(zip)) return centers.get(zip);
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.zippopotam.us/us/' + zip);
        request.setMethod('GET');
        request.setTimeout(3000);
        HttpResponse response = new Http().send(request);
        if (response.getStatusCode()!=200 || response.getBody().length()>50000) return null;
        Map<String,Object> root=(Map<String,Object>)JSON.deserializeUntyped(response.getBody());
        if (String.valueOf(root.get('post code'))!=zip || String.valueOf(root.get('country abbreviation'))!='US') return null;
        List<Object> places=(List<Object>)root.get('places');
        if (places==null || places.isEmpty()) return null;
        Map<String,Object> place=(Map<String,Object>)places[0];
        Decimal lat=Decimal.valueOf(String.valueOf(place.get('latitude')));
        Decimal lng=Decimal.valueOf(String.valueOf(place.get('longitude')));
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
        Location result=Location.newInstance(lat,lng);
        centers.put(zip,result);
        return result;
    }
    private static Response answer(String status,String message,Integer radius) {
        Response response=new Response();
        response.status=status; response.message=message; response.radiusMiles=radius;
        response.resultsJson='[]'; response.hasMore=false;
        response.structuredResultJson=structuredResult(response,new List<Object>(),null);
        return response;
    }
    private static String structuredResult(Response response,List<Object> clubs,Datetime refreshed) {
        Integer count = clubs == null ? 0 : clubs.size();
        String summary;
        if (response.status == 'LISTINGS') {
            summary = 'Found ' + count + ' ' + (count == 1 ? 'club' : 'clubs') + ' within ' + response.radiusMiles + ' miles.';
        } else if (response.status == 'NO_LISTINGS') {
            summary = 'No matching clubs were found within ' + response.radiusMiles + ' miles.';
        } else {
            summary = response.message;
        }
        String fallbackText = summary;
        if (response.status == 'LISTINGS') {
            List<String> lines = new List<String>{summary};
            for (Object item : clubs) {
                Map<String,Object> club = (Map<String,Object>)item;
                lines.add(String.valueOf(club.get('name')) + ', ' + String.valueOf(club.get('city')) + ', '
                    + String.valueOf(club.get('state')) + ', ' + String.valueOf(club.get('distanceMiles')) + ' miles. '
                    + String.valueOf(club.get('accessibilityNote')));
            }
            fallbackText = String.join(lines,'\n');
        }
        return JSON.serialize(new Map<String,Object>{
            'schemaVersion'=>'1.0',
            'status'=>response.status,
            'summary'=>summary,
            'fallbackText'=>fallbackText,
            'radiusMiles'=>response.radiusMiles,
            'distanceBasis'=>'straight_line_from_zip_center',
            'sourceRetrievedAt'=>refreshed == null ? null : refreshed.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
            'hasMore'=>response.hasMore,
            'clubs'=>clubs == null ? new List<Object>() : clubs
        });
    }
    private static Response unavailable(Integer radius) {
        return answer('DIRECTORY_UNAVAILABLE','I could not search the Salesforce club directory. Use the official USA Fencing club finder instead; this is not a no-clubs result.',radius);
    }
}
