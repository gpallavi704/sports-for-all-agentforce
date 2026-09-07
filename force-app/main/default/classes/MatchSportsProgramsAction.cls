public with sharing class MatchSportsProgramsAction {
    private static final Set<String> FEATURES = new Set<String>{'mobility','hearing','visual','cognitive','equipment'};
    public class Request {
        @InvocableVariable(required=true label='City') public String city;
        @InvocableVariable(required=true label='State' description='Two-letter US state code.') public String state;
        @InvocableVariable(label='Age' description='Optional volunteered age for demo class age bands, never official eligibility.') public Integer age;
        @InvocableVariable(label='Experience' description='Optional Beginner, Intermediate or Advanced.') public String experienceLevel;
        @InvocableVariable(label='Requested features' description='Optional comma-separated self-selected mobility, hearing, visual, cognitive, equipment; never infer from a diagnosis.') public String requestedFeatures;
    }
    public class Response {
        @InvocableVariable public String status;
        @InvocableVariable public String message;
        @InvocableVariable public String resultsJson;
    }
    private class Candidate implements Comparable {
        Integer score;
        String sortKey;
        Map<String,Object> value;
        public Integer compareTo(Object other) {
            Candidate c = (Candidate)other;
            if (score != c.score) return score > c.score ? -1 : 1;
            return sortKey.compareTo(c.sortKey);
        }
    }
    @InvocableMethod(label='Match Demo Sports Programs' description='Read-only published synthetic class discovery. No eligibility decision, booking or saved preferences.')
    public static List<Response> matchPrograms(List<Request> requests) {
        List<Response> responses = new List<Response>();
        if (requests == null) return responses;
        Set<String> cities = new Set<String>();
        Set<String> states = new Set<String>();
        for (Request request : requests) {
            String error = validate(request);
            if (requests.size() > 25) error = 'At most 25 requests per invocation.';
            responses.add(result(error == null ? 'PENDING' : 'INVALID_INPUT', error));
            if (error == null) {
                cities.add(request.city.trim());
                states.add(request.state.trim().toUpperCase());
            }
        }
        if (cities.isEmpty()) return responses;
        List<Sports_Program__c> programs;
        Map<Id,Sport__c> sports;
        Map<Id,Sports_Organization__c> organizations;
        try {
            // Query each parent in user mode independently: a visible child must not expose a hidden parent.
            sports = new Map<Id,Sport__c>([SELECT Id,Name FROM Sport__c
                WHERE Published__c=true AND Active__c=true AND Is_Demo__c=true WITH USER_MODE LIMIT 501]);
            organizations = new Map<Id,Sports_Organization__c>([SELECT Id,Name FROM Sports_Organization__c
                WHERE Published__c=true AND Is_Demo__c=true WITH USER_MODE LIMIT 501]);
            Set<Id> sportIds=sports.keySet();
            Set<Id> organizationIds=organizations.keySet();
            // Fixed bind variables, CRUD/FLS/sharing enforcement, publication checks on all parents.
            // Hard demo-only boundary until a separately reviewed production-data release.
            programs = [SELECT Id, Name, City__c, State__c, Minimum_Age__c, Maximum_Age__c,
                Experience_Level__c, Accessibility_Verified__c, Verification_Date__c,
                Supports_Mobility__c, Supports_Hearing__c, Supports_Visual__c, Supports_Cognitive__c,
                Adaptive_Equipment_Available__c, Sport__c, Organization__c
                FROM Sports_Program__c
                WHERE Published__c = true AND Active__c = true AND Is_Demo__c = true
                AND Sport__c IN :sportIds AND Organization__c IN :organizationIds
                AND City__c IN :cities AND State__c IN :states
                WITH USER_MODE ORDER BY Name, Id LIMIT 501];
        } catch (QueryException e) {
            for (Response response : responses) if (response.status == 'PENDING') {
                response.status = 'UNAVAILABLE';
                response.message = 'Program search is unavailable. No private records were returned.';
            }
            return responses;
        }
        for (Integer i = 0; i < requests.size(); i++) {
            if (responses[i].status != 'PENDING') continue;
            if (programs.size() > 500 || sports.size() > 500 || organizations.size() > 500) {
                responses[i] = result('REFINE_SEARCH', 'Search exceeds the demo candidate limit; no partial ranking was returned.');
                continue;
            }
            Request request = requests[i];
            List<Candidate> matches = new List<Candidate>();
            Set<String> features = parseFeatures(request.requestedFeatures);
            for (Sports_Program__c program : programs) {
                if (!program.City__c.equalsIgnoreCase(request.city.trim()) || !program.State__c.equalsIgnoreCase(request.state.trim())) continue;
                if (program.Minimum_Age__c != null && program.Maximum_Age__c != null && program.Minimum_Age__c > program.Maximum_Age__c) continue;
                // Class inventory age bands, not classification or sanctioned competition eligibility.
                if (request.age != null && ((program.Minimum_Age__c != null && request.age < program.Minimum_Age__c)
                    || (program.Maximum_Age__c != null && request.age > program.Maximum_Age__c))) continue;
                Candidate candidate = new Candidate();
                candidate.score = 0;
                candidate.sortKey = program.Name + String.valueOf(program.Id);
                List<String> reasons = new List<String>{'Exact city and state match; no distance calculation.'};
                List<String> unknown = new List<String>();
                if (request.age != null && program.Minimum_Age__c != null && program.Maximum_Age__c != null)
                    reasons.add('Within the listed fictional class age band; not an eligibility decision.');
                else unknown.add('Class age suitability requires provider confirmation.');
                if (!String.isBlank(request.experienceLevel) && request.experienceLevel.trim().equalsIgnoreCase(program.Experience_Level__c)) {
                    candidate.score += 10;
                    reasons.add('Requested experience level matches the listing.');
                } else if (!String.isBlank(request.experienceLevel)) unknown.add('Requested experience level needs confirmation.');
                Boolean recent = program.Accessibility_Verified__c && program.Verification_Date__c != null
                    && program.Verification_Date__c <= Date.today() && program.Verification_Date__c >= Date.today().addDays(-180);
                List<String> ordered = new List<String>(features);
                ordered.sort();
                for (String feature : ordered) {
                    Boolean present = feature == 'mobility' ? program.Supports_Mobility__c
                        : feature == 'hearing' ? program.Supports_Hearing__c
                        : feature == 'visual' ? program.Supports_Visual__c
                        : feature == 'cognitive' ? program.Supports_Cognitive__c : program.Adaptive_Equipment_Available__c;
                    if (recent && present) {
                        candidate.score += 2;
                        reasons.add(feature + ': documented in a simulated verification scenario, not real-world verification.');
                    } else unknown.add(feature + ': unknown; confirm directly. False or stale flags are not evidence of inaccessibility.');
                }
                candidate.value = new Map<String,Object>{'programId'=>program.Id, 'name'=>program.Name,
                    'organization'=>organizations.get(program.Organization__c).Name, 'sport'=>sports.get(program.Sport__c).Name,
                    'city'=>program.City__c, 'state'=>program.State__c, 'isDemo'=>true,
                    'matchPoints'=>candidate.score, 'reasons'=>reasons, 'needsConfirmation'=>unknown,
                    'availability'=>'Not confirmed. No booking or admission guarantee.',
                    'nextStep'=>'Fictional example only. Use official club discovery for real providers.'};
                matches.add(candidate);
            }
            matches.sort();
            List<Map<String,Object>> selected = new List<Map<String,Object>>();
            for (Integer j = 0; j < Math.min(3, matches.size()); j++) selected.add(matches[j].value);
            responses[i] = result(selected.isEmpty() ? 'NO_MATCHES' : 'MATCHES',
                'Synthetic demo inventory only, not real club recommendations or medical/competition eligibility. '
                + 'Match points reflect listing evidence (experience 10; each documented requested feature 2), not human ability or probability. '
                + 'Unknown accessibility stays in results. No preferences were saved; no Case, registration or booking was created.');
            responses[i].resultsJson = JSON.serialize(selected);
        }
        return responses;
    }
    private static Response result(String status, String message) {
        Response r = new Response(); r.status = status; r.message = message; r.resultsJson = '[]'; return r;
    }
    private static Set<String> parseFeatures(String value) {
        Set<String> parsed = new Set<String>();
        if (!String.isBlank(value)) for (String feature : value.toLowerCase().split(',')) parsed.add(feature.trim());
        return parsed;
    }
    private static String validate(Request r) {
        if (r == null || String.isBlank(r.city) || String.isBlank(r.state)) return 'Provide city and two-letter US state; no exact address needed.';
        if (r.city.length() > 80 || !Pattern.matches('[A-Za-z .\'\u002D]+', r.city.trim())
            || !Pattern.matches('[A-Za-z]{2}', r.state.trim())) return 'Use a city name and two-letter state code.';
        if (r.age != null && (r.age < 0 || r.age > 120)) return 'Optional age must be between 0 and 120; do not provide date of birth.';
        if (!String.isBlank(r.experienceLevel) && !new Set<String>{'beginner','intermediate','advanced'}.contains(r.experienceLevel.trim().toLowerCase())) return 'Experience must be Beginner, Intermediate or Advanced.';
        if (r.requestedFeatures != null && r.requestedFeatures.length() > 120) return 'Requested features input is too long.';
        for (String f : parseFeatures(r.requestedFeatures)) if (!FEATURES.contains(f)) return 'Supported preferences: mobility, hearing, visual, cognitive, equipment. Do not provide diagnoses.';
        return null;
    }
}
