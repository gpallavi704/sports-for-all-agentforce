public with sharing class FindPublicFencingClubsAction {
    private static final String DIRECTORY = 'https://www.usafencingutah.com/utah-idaho-clubs';
    private static final Set<String> WEBSITES = new Set<String>{
        'https://www.saltcityswords.com/', 'https://www.wasatchfencing.com/'
    };
    @TestVisible private static List<Public_Fencing_Club__mdt> testListings;

    public class Request {
        @InvocableVariable public String city;
        @InvocableVariable public String previousResultsJson;
        @InvocableVariable(description='Two-letter US state code.') public String state;
        @InvocableVariable(description='Actual latest message, bound by Agent Script. When present, overrides city/state; never stored.') public String latestUserMessage;
    }
    public class Response {
        @InvocableVariable public String status;
        @InvocableVariable public String message;
        @InvocableVariable public String resultsJson;
    }

    @InvocableMethod(label='Find Public Fencing Clubs' description='Read-only curated public club listings. Not confirmed classes, accessibility matches or bookings.')
    public static List<Response> findClubs(List<Request> requests) {
        List<Response> responses = new List<Response>();
        if (requests == null) return responses;
        // Deliberately public configuration, not CRM records. No Account, Contact,
        // Case, private discovery records, callouts, or writes are accessible here.
        List<Public_Fencing_Club__mdt> listings = Test.isRunningTest() && testListings != null
            ? testListings : Public_Fencing_Club__mdt.getAll().values();
        for (Request supplied : requests) {
            Request request = supplied != null && supplied.latestUserMessage != null
                ? locationFromMessage(supplied.latestUserMessage) : supplied;
            // Reuse only one previous public selection for a bounded email-this-club request.
            // Refresh its facts from metadata below; never trust a previous email or URL.
            if(request==null && supplied!=null && supplied.latestUserMessage!=null
                && Pattern.matches('(?i)\\s*(?:help me |can you |please )?(?:email|contact) (?:this|that|the) club(?: about trying wheelchair fencing)?[?.!]?\\s*',supplied.latestUserMessage)
                && supplied.previousResultsJson!=null && supplied.previousResultsJson.length()<20000) {
                try {
                    List<Object> prior=(List<Object>)JSON.deserializeUntyped(supplied.previousResultsJson);
                    if(prior.size()==1) {
                        Map<String,Object> row=(Map<String,Object>)prior[0];
                        if(row.get('recordType')=='public_club_listing'&&row.get('isDemo')==false) {
                            request=new Request();request.city=(String)row.get('city');request.state=(String)row.get('state');
                        }
                    }
                } catch(Exception ignored) { request=null; }
            }
            Response response = new Response();
            response.resultsJson = '[]';
            responses.add(response);
            if (requests.size() > 25 || request == null || String.isBlank(request.city)
                || request.city.trim().length() > 80 || String.isBlank(request.state)
                || !Pattern.matches('[A-Za-z]{2}', request.state.trim())) {
                response.status = 'INVALID_INPUT';
                response.message = 'Please provide one location as City, ST (for example: Salt Lake City, UT). A city and state are needed in the current message; no location is inferred from old messages. At most 25 requests per invocation.';
                continue;
            }
            Map<String, Public_Fencing_Club__mdt> matches = new Map<String, Public_Fencing_Club__mdt>();
            for (Public_Fencing_Club__mdt listing : listings) {
                if (!publishable(listing) || !listing.City__c.equalsIgnoreCase(request.city.trim())
                    || !listing.State__c.equalsIgnoreCase(request.state.trim())) continue;
                matches.put(listing.Club_Name__c + '|' + listing.Website__c, listing);
            }
            List<String> keys = new List<String>(matches.keySet());
            keys.sort();
            List<Object> results = new List<Object>();
            for (String key : keys) {
                if (results.size() == 3) break;
                Public_Fencing_Club__mdt listing = matches.get(key);
                results.add(new Map<String,Object>{
                    'recordType' => 'public_club_listing', 'isDemo' => false,
                    'name' => listing.Club_Name__c, 'city' => listing.City__c, 'state' => listing.State__c,
                    'website' => listing.Website__c,
                    'emailHandoff' => emailHandoff(listing.Website__c),
                    'sourceTitle' => 'USA Fencing Utah/Southern Idaho Division club directory',
                    'sourceUrl' => listing.Source_URL__c,
                    'sourceCheckedOn' => String.valueOf(listing.Source_Checked_On__c),
                    'sourceEffectiveDate' => 'Not provided; checked date is not an effective date.',
                    'matchBasis' => 'Exact city and state; alphabetical order, not distance or suitability ranking.',
                    'parafencingAvailability' => 'Unknown; confirm with the club.',
                    'mobilityAccess' => 'Unknown; confirm with the club.',
                    'adaptiveEquipment' => 'Unknown; confirm with the club.',
                    'needsConfirmation' => new List<String>{
                        'Whether the club currently offers wheelchair fencing and appropriate coaching.',
                        'Step-free entry, accessible facilities, fencing frames and equipment.',
                        'Beginner class availability, age suitability, fees and schedule.'
                    }
                });
            }
            response.status = results.isEmpty() ? 'NO_LISTINGS' : 'LISTINGS';
            response.resultsJson = JSON.serialize(results);
            response.message = results.isEmpty()
                ? 'No current reviewed listing for this exact city/state in our small curated directory. This does not mean no clubs or accessible options exist. Use https://member.usafencing.org/clubs or ask about another city. Do not substitute fictional programs.'
                : 'Real public club listings, not confirmed classes or verified accessible recommendations. Parafencing, access and equipment are unknown. Confirm directly before visiting. Sources were checked, not independently audited. Partial directory, exact city/state only. No booking, support request or registration was created.';
        }
        return responses;
    }

    public static Request locationFromMessage(String message) {
        if (String.isBlank(message) || message.length() > 4500) return null;
        // Bounded explicit format, not medical or semantic inference. We intentionally
        // ask again for missing/ambiguous locations instead of reusing stale state.
        Matcher matcher = Pattern.compile('(?i)(?:\\bin\\s+|\\bnear\\s+|\\bfor\\s+|\\bsearch\\s+|:\\s*|^\\s*)([\\p{L}][\\p{L} .\'-]{0,79}),\\s*(Utah|[A-Za-z]{2})\\b').matcher(message);
        Request found;
        while (matcher.find()) {
            if (found != null) return null;
            found = new Request();
            found.city = matcher.group(1).trim();
            // Strip conversational lead-ins only at explicit separators; never
            // guess a city or silently expand the user's geography.
            List<String> parts = found.city.split('(?i)\\s+(?:in|near|for|search)\\s+');
            found.city = parts[parts.size()-1];
            found.city = found.city.replaceFirst('(?i)^(?:what about|how about|and|try|instead try)\\s+', '').trim();
            found.state = matcher.group(2).equalsIgnoreCase('Utah') ? 'UT' : matcher.group(2).toUpperCase();
        }
        return found;
    }

    private static Boolean publishable(Public_Fencing_Club__mdt listing) {
        return listing != null && listing.Enabled__c == true && !String.isBlank(listing.Club_Name__c)
            && !String.isBlank(listing.City__c) && !String.isBlank(listing.State__c)
            && listing.Source_URL__c == DIRECTORY && WEBSITES.contains(listing.Website__c)
            && listing.Source_Checked_On__c != null && listing.Source_Checked_On__c <= Date.today()
            && listing.Source_Checked_On__c >= Date.today().addDays(-90);
    }

    // Copyable prototype draft only. The configured test inbox stays out of model-visible output.
    @TestVisible private static Map<String,Object> emailHandoff(String website) {
        Date checked=Date.newInstance(2026,9,7);
        if(Date.today()<checked || Date.today()>checked.addDays(90)) return null;
        if(!WEBSITES.contains(website))return null;
        String recipient=System.Label.SportCompass_Demo_Email.trim();
        if(!Pattern.matches('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',recipient))return null;
        String subject='Beginner fencing inquiry';
        String body='Hello, I am interested in an introductory fencing visit. Do you offer wheelchair fencing, step-free access and loaner frames or equipment? Please let me know the available beginner options. Thank you.';
        return new Map<String,Object>{'recipientLabel'=>'Sport Compass Team','subject'=>subject,'body'=>body,
            'sourceUrl'=>website,'checkedOn'=>String.valueOf(checked),
            'isDemo'=>true,
            'delivery'=>'Prototype destination: project team, not the club. Copyable draft only; nothing has been sent.'};
    }
}
