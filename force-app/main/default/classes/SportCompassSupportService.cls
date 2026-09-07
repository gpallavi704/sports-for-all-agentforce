/** Synthetic-only privileged Case capability. No generic Case CRUD is granted to the agent.
 * Public discovery is queried in user mode. The private broker handles only signed draft tokens,
 * an allowlisted Case projection, a fixed queue/record type and current-runtime-user idempotency.
 * No token, signing key, transcript, contact detail or user confirmation text is persisted/logged.
 */
public with sharing class SportCompassSupportService {
    private static final Set<String> CATEGORIES = new Set<String>{
        'Accessibility information needs verification','Equipment question','Getting started','Registration guidance'};
    public class Result {
        public String status; public String message; public String token; public String draft;
        public String caseId; public String caseNumber;
    }
    public class Draft {
        public String key; public String actor; public Long expires;
        public String program; public String category; public String text;
    }
    public class SupportException extends Exception {}
    private static Result result(String status,String message) {
        Result r=new Result();r.status=status;r.message=message;return r;
    }
    private static void authorize() {
        if(!FeatureManagement.checkPermission('SportCompass_Create_Demo_Support')) throw new SupportException('Denied');
    }
    private static Sports_Program__c visibleProgram(String value) {
        Id programId;
        try {programId=Id.valueOf(value);} catch(Exception e){throw new SupportException('Invalid program');}
        if(programId.getSObjectType()!=Sports_Program__c.SObjectType) throw new SupportException('Invalid program');
        List<Sports_Program__c> rows=[SELECT Id,Name,City__c,State__c,Sport__c,Organization__c
            FROM Sports_Program__c WHERE Id=:programId AND Published__c=true AND Active__c=true AND Is_Demo__c=true WITH USER_MODE];
        if(rows.isEmpty()) throw new SupportException('Unavailable program');
        Id sportId=rows[0].Sport__c;Id organizationId=rows[0].Organization__c;
        List<Sport__c> sports=[SELECT Id FROM Sport__c WHERE Id=:sportId AND Published__c=true AND Active__c=true AND Is_Demo__c=true WITH USER_MODE];
        List<Sports_Organization__c> organizations=[SELECT Id FROM Sports_Organization__c WHERE Id=:organizationId AND Published__c=true AND Is_Demo__c=true WITH USER_MODE];
        if(sports.isEmpty()||organizations.isEmpty()) throw new SupportException('Unavailable parent');
        return rows[0];
    }
    private static String draftText(Sports_Program__c p,String category) {
        return 'SYNTHETIC DEMO SUPPORT REQUEST\nProgram: '+p.Name+'\nProgram location: '+p.City__c+', '+p.State__c
            +'\nReason: '+category+'\nAccessibility information: Needs confirmation; not real-world verification.'
            +'\nDestination: Sport Compass Support demo queue in this Salesforce org.'
            +'\nResponse channel: Demo queue only. No email, phone, SMS or real staff response promised.'
            +'\nSaved on confirmation: this summary, selected program reference, category, demo and consent flags, technical request key and runtime user, plus standard Salesforce audit fields.'
            +'\nNo name, age, diagnosis, contact details or transcript will be saved by this action.';
    }
    public static Result prepare(String programId,String category) {
        try {
            authorize();
            if(!CATEGORIES.contains(category)) return result('INVALID_INPUT','Choose an allowed support reason. Do not provide medical or personal details.');
            Sports_Program__c p=visibleProgram(programId);
            Draft d=new Draft();d.key=EncodingUtil.convertToHex(Crypto.generateAesKey(256));
            d.actor=UserInfo.getUserId();d.expires=DateTime.now().addMinutes(30).getTime();
            d.program=p.Id;d.category=category;d.text=draftText(p,category);
            String payload=EncodingUtil.base64Encode(Blob.valueOf(JSON.serialize(d)));
            String signature=EncodingUtil.base64Encode(Crypto.generateMac('HmacSHA256',Blob.valueOf(payload),new Broker().key()));
            Result r=result('PREPARED','Nothing has been saved. Show the complete draft, then ask whether to create this demo Case. Reply yes, no or change.');
            r.token=payload+'.'+signature;r.draft=d.text;return r;
        } catch(Exception e){return result('UNAVAILABLE','Support preparation is unavailable or the program is not accessible. No Case was created.');}
    }
    public static String reviewReply(String latestUserMessage) {
        String answer=latestUserMessage==null?'':latestUserMessage.trim().toLowerCase();
        if(new Set<String>{'no','no thanks','cancel','discard','do not create','do not create it'}.contains(answer))return 'DECLINED';
        if(new Set<String>{'change','change it','edit','revise'}.contains(answer)||answer.startsWith('change it to '))return 'REVISE';
        if(new Set<String>{'yes','yes please','yes, please','confirm','i confirm'}.contains(answer))return 'CONFIRM';
        return 'AWAITING_CONSENT';
    }
    public static Result confirm(String token,String latestUserMessage) {
        try {
            authorize();
            String reply=reviewReply(latestUserMessage);
            if(reply=='DECLINED') return result('DECLINED','No new Case was created. Discard this draft; existing Cases are not deleted.');
            if(reply=='REVISE') return result('REVISE','No new Case was created. Discard this token and prepare a revised draft.');
            if(reply!='CONFIRM')
                return result('AWAITING_CONSENT','No Case was created. Consent must be an unambiguous yes to the displayed draft. Maybe, probably, silence or qualified consent is not confirmation.');
            if(String.isBlank(token)||token.length()>12000) throw new SupportException('Invalid token');
            List<String> parts=token.split('\\.');
            if(parts.size()!=2) throw new SupportException('Invalid token');
            if(!Crypto.verifyHMac('HmacSHA256',Blob.valueOf(parts[0]),new Broker().key(),EncodingUtil.base64Decode(parts[1]))) throw new SupportException('Invalid signature');
            Draft d=(Draft)JSON.deserializeStrict(EncodingUtil.base64Decode(parts[0]).toString(),Draft.class);
            if(d.actor!=UserInfo.getUserId()||d.expires<DateTime.now().getTime()||!CATEGORIES.contains(d.category)
                ||!Pattern.matches('[0-9a-f]{64}',d.key)) throw new SupportException('Invalid draft');
            Sports_Program__c p=visibleProgram(d.program);
            if(d.text!=draftText(p,d.category)) return result('STALE_DRAFT','Program information changed. No new Case was created; prepare and approve a new draft.');
            return new Broker().createOrFind(d);
        } catch(Exception e){return result('UNAVAILABLE','Support confirmation could not be completed. No successful Case creation is confirmed. Do not claim a Case exists.');}
    }
    // Intentional narrow system-mode boundary: agent has no generic Case or signing-key access.
    private without sharing class Broker {
        public Blob key() {
            SportCompass_Security__c config=SportCompass_Security__c.getOrgDefaults();
            if(config==null||String.isBlank(config.Signing_Key__c)) throw new SupportException('Not configured');
            Blob key=EncodingUtil.base64Decode(config.Signing_Key__c);
            if(key.size()!=32)throw new SupportException('Not configured');
            return key;
        }
        public Result createOrFind(Draft d) {
            String hash=EncodingUtil.convertToHex(Crypto.generateDigest('SHA-256',Blob.valueOf(JSON.serialize(d))));
            List<Case> previous=[SELECT Id,CaseNumber,SC_Request_Hash__c FROM Case
                WHERE SC_Request_Key__c=:d.key AND SC_Runtime_User__c=:d.actor AND SC_Is_Demo__c=true LIMIT 1];
            if(!previous.isEmpty())return existing(previous[0],hash);
            List<Group> queues=[SELECT Id FROM Group WHERE Type='Queue' AND DeveloperName='SportCompass_Support' LIMIT 1];
            List<RecordType> types=[SELECT Id FROM RecordType WHERE SobjectType='Case' AND DeveloperName='SportCompass_Support' AND IsActive=true LIMIT 1];
            if(queues.isEmpty()||types.isEmpty())throw new SupportException('Missing destination');
            Case c=new Case(Subject='DEMO - '+d.category,Description=d.text,Status='New',Origin='Web',
                OwnerId=queues[0].Id,RecordTypeId=types[0].Id,SC_Request_Key__c=d.key,SC_Request_Hash__c=hash,
                SC_Runtime_User__c=d.actor,SC_Consent_Confirmed__c=true,SC_Is_Demo__c=true,SC_Program__c=d.program,
                SC_Support_Category__c=d.category,SC_Accessibility_Status__c='Needs confirmation',
                SC_Reply_Channel__c='Demo queue only',SC_Consent_Draft__c=d.text);
            Database.DMLOptions options=new Database.DMLOptions();
            options.emailHeader.triggerUserEmail=false;options.emailHeader.triggerOtherEmail=false;options.emailHeader.triggerAutoResponseEmail=false;
            c.setOptions(options);
            Database.SaveResult saved=Database.insert(c,false);
            if(!saved.isSuccess()) {
                // The unique key also protects concurrent retries. Never expose arbitrary Case data.
                List<Case> raced=[SELECT Id,CaseNumber,SC_Request_Hash__c FROM Case
                    WHERE SC_Request_Key__c=:d.key AND SC_Runtime_User__c=:d.actor AND SC_Is_Demo__c=true LIMIT 1];
                if(!raced.isEmpty())return existing(raced[0],hash);
                throw new SupportException('Write failed');
            }
            Case created=[SELECT Id,CaseNumber FROM Case WHERE Id=:c.Id];
            Result r=result('CREATED','Created one synthetic Case in the Sport Compass Support queue. No external message was sent or real staff response promised.');
            r.caseId=created.Id;r.caseNumber=created.CaseNumber;return r;
        }
        public Result existing(Case c,String hash) {
            if(c.SC_Request_Hash__c!=hash)throw new SupportException('Request mismatch');
            Result r=result('EXISTING','This request already created a demo Case. No duplicate was created.');
            r.caseId=c.Id;r.caseNumber=c.CaseNumber;return r;
        }
    }
}
