public with sharing class PrepareSportsSupportAction {
    public class Request {
        @InvocableVariable(required=true) public String programId;
        @InvocableVariable(required=true) public String category;
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
            else {SportCompassSupportService.Result value=SportCompassSupportService.prepare(input.programId,input.category);
                r.status=value.status;r.message=value.message;r.draft=value.draft;r.token=value.token;}
            out.add(r);
        }return out;
    }
}
