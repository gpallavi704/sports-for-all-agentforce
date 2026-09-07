public with sharing class CreateSportsSupportCaseAction {
    public class Request {
        @InvocableVariable(required=true) public String token;
        @InvocableVariable(required=true description='Bind directly to system_variables.user_input, never model slot filling.') public String latestUserMessage;
    }
    public class Response {
        @InvocableVariable public String status;
        @InvocableVariable public String message;
        @InvocableVariable public String caseId;
        @InvocableVariable public String caseNumber;
    }
    @InvocableMethod(label='Confirm Demo Sports Support' description='Validate actual explicit user confirmation and signed draft; create at most one synthetic Case per request key.')
    public static List<Response> confirm(List<Request> requests) {
        List<Response> out=new List<Response>();if(requests==null)return out;
        for(Request input:requests){
            Response r=new Response();
            if(requests.size()>10||input==null){r.status='INVALID_INPUT';r.message='At most ten valid confirmations; no Case created.';}
            else {SportCompassSupportService.Result value=SportCompassSupportService.confirm(input.token,input.latestUserMessage);
                r.status=value.status;r.message=value.message;r.caseId=value.caseId;r.caseNumber=value.caseNumber;}
            out.add(r);
        }return out;
    }
}
