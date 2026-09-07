@IsTest
private class SportCompassSupportServiceTest {
    @TestSetup static void setupData() {
        System.runAs(new User(Id=UserInfo.getUserId())) {
            User actor=new User(Alias='scsupp',Email='supportactor@example.invalid',EmailEncodingKey='UTF-8',LastName='SupportTestActor',LanguageLocaleKey='en_US',LocaleSidKey='en_US',TimeZoneSidKey='America/Los_Angeles',Username='supportactor.'+Crypto.getRandomLong()+'@example.invalid',ProfileId=UserInfo.getProfileId());
            insert actor;
            insert new PermissionSetAssignment(AssigneeId=actor.Id,PermissionSetId=[SELECT Id FROM PermissionSet WHERE Name='SportCompass_Support_Runtime'].Id);
            insert new PermissionSetAssignment(AssigneeId=actor.Id,PermissionSetId=[SELECT Id FROM PermissionSet WHERE Name='SportCompass_Discovery_Read'].Id);
        }
        insert new SportCompass_Security__c(SetupOwnerId=UserInfo.getOrganizationId(),Signing_Key__c=EncodingUtil.base64Encode(Crypto.generateAesKey(256)));
        Sport__c s=new Sport__c(Name='DEMO Sport',Published__c=true,Is_Demo__c=true,Active__c=true);insert s;
        Sports_Organization__c o=new Sports_Organization__c(Name='DEMO Organization',Published__c=true,Is_Demo__c=true);insert o;
        insert new Sports_Program__c(Name='DEMO Youth',Program_Code__c='SUPPORT-TEST',Sport__c=s.Id,Organization__c=o.Id,
            Published__c=true,Active__c=true,Is_Demo__c=true,City__c='Salt Lake City',State__c='UT');
    }
    private static User testActor(){return [SELECT Id FROM User WHERE LastName='SupportTestActor' LIMIT 1];}
    private static Id programId(){return [SELECT Id FROM Sports_Program__c LIMIT 1].Id;}
    private static SportCompassSupportService.Result prepare(){return SportCompassSupportService.prepare(programId(),'Accessibility information needs verification');}
    @IsTest static void preparationDoesNotWrite() {
        System.runAs(testActor()) {
        Test.startTest();Integer before=Limits.getDmlStatements();SportCompassSupportService.Result r=prepare();
        System.assertEquals(before,Limits.getDmlStatements());Test.stopTest();
        System.assertEquals('PREPARED',r.status);System.assertNotEquals(null,r.token);
        System.assert(r.draft.contains('No name, age, diagnosis, contact details or transcript'));
        System.assertEquals(0,[SELECT COUNT() FROM Case]);
        }
    }
    @IsTest static void hesitationAndRefusalCreateNothing() {
        System.runAs(testActor()) {
        String token=prepare().token;
        for(String answer:new List<String>{'maybe','probably','I guess so','','yes but change the program','yes, if you email me'})
            System.assertEquals('AWAITING_CONSENT',SportCompassSupportService.confirm(token,answer).status,answer);
        System.assertEquals('AWAITING_CONSENT',SportCompassSupportService.confirm(token,null).status);
        System.assertEquals('DECLINED',SportCompassSupportService.confirm(token,'no').status);
        System.assertEquals('REVISE',SportCompassSupportService.confirm(token,'change it').status);
        System.assertEquals(0,[SELECT COUNT() FROM Case]);
        }
    }
    @IsTest static void confirmsExactlyOnceAndUsesQueue() {
        System.runAs(testActor()) {
        String token=prepare().token;
        Test.startTest();SportCompassSupportService.Result first=SportCompassSupportService.confirm(token,'yes');
        SportCompassSupportService.Result retry=SportCompassSupportService.confirm(token,'I confirm');Test.stopTest();
        System.assertEquals('CREATED',first.status,first.message);System.assertEquals('EXISTING',retry.status);
        System.assertEquals(first.caseId,retry.caseId);System.assertNotEquals(null,first.caseNumber);
        System.assertEquals(1,[SELECT COUNT() FROM Case]);
        Case c=[SELECT OwnerId,SC_Consent_Confirmed__c,SC_Is_Demo__c,SC_Program__c,SC_Reply_Channel__c,ContactId,SuppliedEmail FROM Case LIMIT 1];
        System.assertEquals([SELECT Id FROM Group WHERE DeveloperName='SportCompass_Support'].Id,c.OwnerId);
        System.assert(c.SC_Consent_Confirmed__c&&c.SC_Is_Demo__c);System.assertEquals(programId(),c.SC_Program__c);
        System.assertEquals('Demo queue only',c.SC_Reply_Channel__c);System.assertEquals(null,c.ContactId);System.assertEquals(null,c.SuppliedEmail);
        }
    }
    @IsTest static void rejectsTamperingAndExpiredToken() {
        System.runAs(testActor()) {
        String token=prepare().token;
        System.assertEquals('UNAVAILABLE',SportCompassSupportService.confirm('bad','yes').status);
        System.assertEquals('UNAVAILABLE',SportCompassSupportService.confirm(null,'yes').status);
        System.assertEquals('UNAVAILABLE',SportCompassSupportService.confirm(token+'bad','yes').status);
        List<String> parts=token.split('\\.');
        SportCompassSupportService.Draft d=(SportCompassSupportService.Draft)JSON.deserialize(EncodingUtil.base64Decode(parts[0]).toString(),SportCompassSupportService.Draft.class);
        d.expires=DateTime.now().addMinutes(-1).getTime();
        String payload=EncodingUtil.base64Encode(Blob.valueOf(JSON.serialize(d)));
        Blob key=EncodingUtil.base64Decode(SportCompass_Security__c.getOrgDefaults().Signing_Key__c);
        String expired=payload+'.'+EncodingUtil.base64Encode(Crypto.generateMac('HmacSHA256',Blob.valueOf(payload),key));
        System.assertEquals('UNAVAILABLE',SportCompassSupportService.confirm(expired,'yes').status);
        System.assertEquals(0,[SELECT COUNT() FROM Case]);
        }
    }
    @IsTest static void programChangesRequireNewConsent() {
        System.runAs(testActor()) {
        String token=prepare().token;
        Sports_Program__c p=[SELECT Id,Name FROM Sports_Program__c LIMIT 1];p.Name='DEMO Changed';update p;
        System.assertEquals('STALE_DRAFT',SportCompassSupportService.confirm(token,'yes').status);
        p.Published__c=false;update p;
        System.assertEquals('UNAVAILABLE',SportCompassSupportService.confirm(token,'yes').status);
        System.assertEquals('UNAVAILABLE',prepare().status);System.assertEquals(0,[SELECT COUNT() FROM Case]);
        }
    }
    @IsTest static void rejectsUnstructuredAndUnavailableInputs() {
        System.runAs(testActor()) {
        System.assertEquals('INVALID_INPUT',SportCompassSupportService.prepare(programId(),'My diagnosis is ...').status);
        System.assertEquals('UNAVAILABLE',SportCompassSupportService.prepare('invalid','Getting started').status);
        System.assertEquals('UNAVAILABLE',SportCompassSupportService.prepare(UserInfo.getUserId(),'Getting started').status);
        SportCompass_Security__c key=SportCompass_Security__c.getOrgDefaults();key.Signing_Key__c=null;update key;
        System.assertEquals('UNAVAILABLE',prepare().status);System.assertEquals(0,[SELECT COUNT() FROM Case]);
        }
    }
    @IsTest static void deniesUnprivilegedCaller() {
        System.runAs(testActor()) {
        User u=new User(Alias='support',Email='support@example.invalid',EmailEncodingKey='UTF-8',LastName='SyntheticSupport',
            LanguageLocaleKey='en_US',LocaleSidKey='en_US',TimeZoneSidKey='America/Los_Angeles',
            Username='support.'+Crypto.getRandomLong()+'@example.invalid',ProfileId=[SELECT Id FROM Profile WHERE Name='Minimum Access - Salesforce' LIMIT 1].Id);
        insert u;
        String token=prepare().token;
        System.runAs(u){
            System.assertEquals('UNAVAILABLE',SportCompassSupportService.prepare('invalid','Getting started').status);
            System.assertEquals('UNAVAILABLE',SportCompassSupportService.confirm(token,'yes').status);
            }
    }
        System.assertEquals(0,[SELECT COUNT() FROM Case]);
    }
    @IsTest static void invocableWrappersAndBatchBounds() {
        System.runAs(testActor()) {
        System.assertEquals(0,PrepareSportsSupportAction.prepare(null).size());
        System.assertEquals(0,CreateSportsSupportCaseAction.confirm(null).size());
        PrepareSportsSupportAction.Request p=new PrepareSportsSupportAction.Request();p.programId=programId();p.category='Getting started';
        PrepareSportsSupportAction.Response draft=PrepareSportsSupportAction.prepare(new List<PrepareSportsSupportAction.Request>{p})[0];
        System.assertEquals('PREPARED',draft.status);
        CreateSportsSupportCaseAction.Request c=new CreateSportsSupportCaseAction.Request();c.token=draft.token;c.latestUserMessage='maybe';
        System.assertEquals('AWAITING_CONSENT',CreateSportsSupportCaseAction.confirm(new List<CreateSportsSupportCaseAction.Request>{c})[0].status);
        System.assertEquals('INVALID_INPUT',PrepareSportsSupportAction.prepare(new List<PrepareSportsSupportAction.Request>{null})[0].status);
        System.assertEquals('INVALID_INPUT',CreateSportsSupportCaseAction.confirm(new List<CreateSportsSupportCaseAction.Request>{null})[0].status);
        List<PrepareSportsSupportAction.Request> manyP=new List<PrepareSportsSupportAction.Request>();
        List<CreateSportsSupportCaseAction.Request> manyC=new List<CreateSportsSupportCaseAction.Request>();
        for(Integer i=0;i<11;i++){manyP.add(p);manyC.add(c);}
        System.assertEquals('INVALID_INPUT',PrepareSportsSupportAction.prepare(manyP)[10].status);
        System.assertEquals('INVALID_INPUT',CreateSportsSupportCaseAction.confirm(manyC)[10].status);
        System.assertEquals(0,[SELECT COUNT() FROM Case]);
        }
    }
}
