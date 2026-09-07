public with sharing class PrepareSportsSupportAction {
    public class Request {
        @InvocableVariable public String programId;
        @InvocableVariable public String category;
        @InvocableVariable public String latestUserMessage;
        @InvocableVariable public String matchedProgramsJson;
    }
    public class Response {
        @InvocableVariable public String status;
        @InvocableVariable public String message;
        @InvocableVariable public String draft;
        @InvocableVariable public String token;
    }
    @InvocableMethod(label='Prepare Demo Sports Support' description='Prepare an expiring signed draft without saving personal data or creating a Case.')
    public static List<Response> prepare(List<Request> requests) {
        List<Response> out=new List<Response>();if(requests==null)return out;
        for(Request input:requests){
            Response r=new Response();
            if(requests.size()>10||input==null){r.status='INVALID_INPUT';r.message='At most ten valid requests; nothing saved.';}
            else {SportCompassSupportService.Result value=input.latestUserMessage == null
                    ? SportCompassSupportService.prepare(input.programId,input.category) : prepareCurrent(input);
                r.status=value.status;r.message=value.message;r.draft=value.draft;r.token=value.token;}
            out.add(r);
        }return out;
    }
    private static SportCompassSupportService.Result prepareCurrent(Request input) {
        SportCompassSupportService.Result invalid=new SportCompassSupportService.Result();
        invalid.status='INVALID_INPUT';
        invalid.message='No draft or Case created. Select an exact program name from the latest demo results and one reason: Accessibility information needs verification, Equipment question, Getting started, or Registration guidance.';
        String message=input.latestUserMessage;
        if(String.isBlank(message)||message.length()>4500||String.isBlank(input.matchedProgramsJson)
            ||input.matchedProgramsJson.length()>30000||SportCompassSupportService.reviewReply(message)!='AWAITING_CONSENT') return invalid;
        try {
            String lower=message.toLowerCase(),category;
            Integer categories=0;
            for(String allowed:new List<String>{'Accessibility information needs verification','Equipment question','Getting started','Registration guidance'}) {
                if(lower.contains(allowed.toLowerCase())) {category=allowed;categories++;}
            }
            if(categories!=1)return invalid;
            List<Object> candidates=(List<Object>)JSON.deserializeUntyped(input.matchedProgramsJson);
            if(candidates.size()>3)return invalid;
            String selected;Integer matches=0;
            for(Object raw:candidates) {
                Map<String,Object> candidate=(Map<String,Object>)raw;
                String name=(String)candidate.get('name');
                if(candidate.get('isDemo')==true&&!String.isBlank(name)&&lower.contains(name.toLowerCase())) {
                    selected=(String)candidate.get('programId');matches++;
                }
            }
            if(matches!=1)return invalid;
            // The service rechecks current record visibility, demo/publication flags and allowed category.
            // A signed draft alone is never consent. No write occurs here.
            return SportCompassSupportService.prepare(selected,category);
        } catch(Exception e) {return invalid;}
    }
}
