/** Pure, deterministic reply classification. No queries, writes or model calls. */
public with sharing class ReviewSportsSupportReplyAction {
    public class Request { @InvocableVariable public String latestUserMessage; }
    public class Response { @InvocableVariable public String state; }
    @InvocableMethod(label='Review Support Reply' description='Read-only classification of the actual user reply. Never creates a Case.')
    public static List<Response> review(List<Request> requests){
        List<Response> out=new List<Response>();if(requests==null)return out;
        for(Request r:requests){Response value=new Response();
            value.state=SportCompassSupportService.reviewReply(r==null?null:r.latestUserMessage);out.add(value);}
        return out;
    }
}
