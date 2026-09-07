@IsTest
private class MatchSportsProgramsActionTest {
    @TestSetup static void setupData() {
        Sport__c sport = new Sport__c(Name='Demo Sport', Published__c=true, Is_Demo__c=true, Active__c=true);
        insert sport;
        Sports_Organization__c org = new Sports_Organization__c(Name='Demo Org', Published__c=true, Is_Demo__c=true);
        insert org;
        List<Sports_Program__c> rows = new List<Sports_Program__c>();
        rows.add(program('Youth documented', 'Salt Lake City', 10, 17));
        rows[0].Accessibility_Verified__c=true; rows[0].Verification_Date__c=Date.today();
        rows[0].Supports_Mobility__c=true; rows[0].Adaptive_Equipment_Available__c=true;
        rows.add(program('Youth unknown', 'Salt Lake City', 10, 17));
        rows.add(program('Adult unknown', 'Salt Lake City', 18, 99));
        rows.add(program('Private', 'Salt Lake City', 10, 17)); rows[3].Published__c=false;
        rows.add(program('Inactive', 'Salt Lake City', 10, 17)); rows[4].Active__c=false;
        rows.add(program('Real data excluded', 'Salt Lake City', 10, 17)); rows[5].Is_Demo__c=false;
        insert rows;
    }
    private static Sports_Program__c program(String name, String city, Integer low, Integer high) {
        return new Sports_Program__c(Name=name, Program_Code__c='TEST-'+name, Sport__c=[SELECT Id FROM Sport__c LIMIT 1].Id,
            Organization__c=[SELECT Id FROM Sports_Organization__c LIMIT 1].Id,
            Published__c=true, Is_Demo__c=true, Active__c=true, City__c=city, State__c='UT',
            Minimum_Age__c=low, Maximum_Age__c=high, Experience_Level__c='Beginner');
    }
    private static MatchSportsProgramsAction.Request request(Integer age) {
        MatchSportsProgramsAction.Request r = new MatchSportsProgramsAction.Request();
        r.city='Salt Lake City'; r.state='UT'; r.age=age; r.experienceLevel='Beginner'; r.requestedFeatures='mobility,equipment'; return r;
    }
    private static MatchSportsProgramsAction.Response callOne(MatchSportsProgramsAction.Request r) {
        return MatchSportsProgramsAction.matchPrograms(new List<MatchSportsProgramsAction.Request>{r})[0];
    }
    private static List<Object> matches(MatchSportsProgramsAction.Response r) {
        return (List<Object>)JSON.deserializeUntyped(r.resultsJson);
    }
    @IsTest static void ranksEvidenceWithoutExcludingUnknown() {
        Test.startTest();
        Integer queries=Limits.getQueries(); Integer dml=Limits.getDmlStatements();
        MatchSportsProgramsAction.Response response=callOne(request(12));
        System.assertEquals(3, Limits.getQueries()-queries);
        System.assertEquals(dml, Limits.getDmlStatements(), 'Action must not write');
        Test.stopTest();
        System.assertEquals('MATCHES',response.status);
        List<Object> rows=matches(response); System.assertEquals(2,rows.size());
        Map<String,Object> first=(Map<String,Object>)rows[0];
        System.assertEquals('Youth documented',first.get('name'));
        System.assertEquals(14,first.get('matchPoints'));
        System.assertEquals(true,first.get('isDemo'));
        System.assertEquals('Youth unknown',((Map<String,Object>)rows[1]).get('name'));
        System.assert(response.resultsJson.contains('unknown; confirm directly'));
        System.assert(!response.resultsJson.contains('Private'));
        System.assert(!response.resultsJson.contains('Real data'));
        System.assert(!response.resultsJson.contains('Inactive'));
    }
    @IsTest static void batchOrderAndAgeBands() {
        Test.startTest();
        List<MatchSportsProgramsAction.Response> rows=MatchSportsProgramsAction.matchPrograms(
            new List<MatchSportsProgramsAction.Request>{request(12),request(25),request(4)});
        System.assertEquals(3,Limits.getQueries());
        Test.stopTest();
        System.assertEquals(3,rows.size());
        System.assertEquals(2,matches(rows[0]).size());
        System.assertEquals('Adult unknown',((Map<String,Object>)matches(rows[1])[0]).get('name'));
        System.assertEquals('NO_MATCHES',rows[2].status);
    }
    @IsTest static void optionalInputsAndCityIsolation() {
        MatchSportsProgramsAction.Request r=request(null);r.experienceLevel=null;r.requestedFeatures=null;
        System.assertEquals(3,matches(callOne(r)).size());
        r=request(12);r.city=' salt lake city ';r.state='ut';
        System.assertEquals(2,matches(callOne(r)).size());
        r.city='Boston';r.state='MA';System.assertEquals('NO_MATCHES',callOne(r).status);
        r.city='Salt Lake City';System.assertEquals('NO_MATCHES',callOne(r).status);
        r=request(12);r.experienceLevel='Advanced';System.assert(callOne(r).resultsJson.contains('experience level needs confirmation'));
    }
    @IsTest static void datesAndFeatureFlags() {
        Sports_Program__c p=program('Stale','Aging',null,null);
        p.Supports_Mobility__c=true;p.Supports_Hearing__c=true;p.Supports_Visual__c=true;p.Supports_Cognitive__c=true;
        p.Accessibility_Verified__c=true;p.Verification_Date__c=Date.today().addDays(-181);insert p;
        MatchSportsProgramsAction.Request r=request(null);r.city='Aging';r.requestedFeatures='mobility,hearing,visual,cognitive';
        System.assertEquals(10,((Map<String,Object>)matches(callOne(r))[0]).get('matchPoints'));
        p.Verification_Date__c=Date.today().addDays(1);update p;
        System.assertEquals(10,((Map<String,Object>)matches(callOne(r))[0]).get('matchPoints'));
        p.Verification_Date__c=Date.today();update p;
        System.assertEquals(18,((Map<String,Object>)matches(callOne(r))[0]).get('matchPoints'));
        p.Minimum_Age__c=20;p.Maximum_Age__c=10;update p;
        System.assertEquals('NO_MATCHES',callOne(r).status);
    }
    @IsTest static void parentsMustBePublishedDemo() {
        Sport__c sport=[SELECT Id,Published__c,Is_Demo__c,Active__c FROM Sport__c LIMIT 1];
        sport.Published__c=false;update sport;System.assertEquals('NO_MATCHES',callOne(request(12)).status);
        sport.Published__c=true;sport.Is_Demo__c=false;update sport;System.assertEquals('NO_MATCHES',callOne(request(12)).status);
        sport.Is_Demo__c=true;sport.Active__c=false;update sport;System.assertEquals('NO_MATCHES',callOne(request(12)).status);
        sport.Active__c=true;update sport;
        Sports_Organization__c org=[SELECT Id,Published__c,Is_Demo__c FROM Sports_Organization__c LIMIT 1];
        org.Published__c=false;update org;System.assertEquals('NO_MATCHES',callOne(request(12)).status);
        org.Published__c=true;org.Is_Demo__c=false;update org;System.assertEquals('NO_MATCHES',callOne(request(12)).status);
    }
    @IsTest static void validatesAndBoundsInput() {
        System.assertEquals(0,MatchSportsProgramsAction.matchPrograms(null).size());
        System.assertEquals(0,MatchSportsProgramsAction.matchPrograms(new List<MatchSportsProgramsAction.Request>()).size());
        System.assertEquals('INVALID_INPUT',callOne(null).status);
        MatchSportsProgramsAction.Request r=request(12);r.city=null;System.assertEquals('INVALID_INPUT',callOne(r).status);
        r=request(12);r.city='x\' OR Name != null';System.assertEquals('INVALID_INPUT',callOne(r).status);
        r=request(12);r.state='Utah';System.assertEquals('INVALID_INPUT',callOne(r).status);
        r=request(-1);System.assertEquals('INVALID_INPUT',callOne(r).status);
        r=request(121);System.assertEquals('INVALID_INPUT',callOne(r).status);
        r=request(12);r.experienceLevel='expert';System.assertEquals('INVALID_INPUT',callOne(r).status);
        r=request(12);r.requestedFeatures='diagnosis';System.assertEquals('INVALID_INPUT',callOne(r).status);
        r.requestedFeatures='x'.repeat(121);System.assertEquals('INVALID_INPUT',callOne(r).status);
        List<MatchSportsProgramsAction.Request> many=new List<MatchSportsProgramsAction.Request>();
        for(Integer i=0;i<26;i++)many.add(request(12));
        Test.startTest();List<MatchSportsProgramsAction.Response> responses=MatchSportsProgramsAction.matchPrograms(many);
        System.assertEquals(0,Limits.getQueries());Test.stopTest();
        System.assertEquals(26,responses.size());System.assertEquals('INVALID_INPUT',responses[25].status);
    }
    @IsTest static void refusesTruncatedRanking() {
        Sports_Program__c template=program('Template','Overflow',10,17);
        List<Sports_Program__c> rows=new List<Sports_Program__c>();
        for(Integer i=0;i<501;i++){Sports_Program__c p=template.clone(false);p.Name='Overflow '+i;p.Program_Code__c='OVERFLOW-'+i;rows.add(p);}
        insert rows;
        MatchSportsProgramsAction.Request r=request(12);r.city='Overflow';
        Test.startTest();MatchSportsProgramsAction.Response response=callOne(r);Test.stopTest();
        System.assertEquals('REFINE_SEARCH',response.status);System.assertEquals('[]',response.resultsJson);
    }
    private static User restrictedUser() {
        return new User(Alias='scmatch',Email='match@example.invalid',EmailEncodingKey='UTF-8',
            LastName='SyntheticMatchTest',LanguageLocaleKey='en_US',LocaleSidKey='en_US',TimeZoneSidKey='America/Los_Angeles',
            Username='match.'+String.valueOf(Crypto.getRandomLong())+'@example.invalid',
            ProfileId=[SELECT Id FROM Profile WHERE Name='Minimum Access - Salesforce' LIMIT 1].Id);
    }
    @IsTest static void deniesObjectAccess() {
        User user=restrictedUser();insert user;
        System.runAs(user){
            Test.startTest();MatchSportsProgramsAction.Response response=callOne(request(12));Test.stopTest();
            System.assertEquals('UNAVAILABLE',response.status);System.assertEquals('[]',response.resultsJson);
        }
    }
    @IsTest static void respectsRecordSharing() {
        User user=restrictedUser();
        System.runAs(new User(Id=UserInfo.getUserId())) {
            insert user;
            List<PermissionSetAssignment> assignments=new List<PermissionSetAssignment>();
            for(PermissionSet ps:[SELECT Id FROM PermissionSet WHERE Name IN ('SportCompass_Discovery_Read','SportCompass_Program_Matching')])
                assignments.add(new PermissionSetAssignment(AssigneeId=user.Id,PermissionSetId=ps.Id));
            System.assertEquals(2,assignments.size());insert assignments;
        }
        Sports_Program__c p=[SELECT Id,Sport__c,Organization__c FROM Sports_Program__c WHERE Name='Youth documented' LIMIT 1];
        insert new Sport__Share(ParentId=p.Sport__c,UserOrGroupId=user.Id,AccessLevel='Read',RowCause='Manual');
        insert new Sports_Organization__Share(ParentId=p.Organization__c,UserOrGroupId=user.Id,AccessLevel='Read',RowCause='Manual');
        insert new Sports_Program__Share(ParentId=p.Id,UserOrGroupId=user.Id,AccessLevel='Read',RowCause='Manual');
        System.runAs(user){
            Test.startTest();MatchSportsProgramsAction.Response response=callOne(request(12));Test.stopTest();
            System.assertEquals('MATCHES',response.status);
            System.assertEquals(1,matches(response).size(),'Unshared published record must stay hidden');
            System.assertEquals('Youth documented',((Map<String,Object>)matches(response)[0]).get('name'));
        }
    }
    @IsTest static void visibleChildDoesNotExposeHiddenParents() {
        User user=restrictedUser();
        System.runAs(new User(Id=UserInfo.getUserId())) {
            insert user;
            List<PermissionSetAssignment> assignments=new List<PermissionSetAssignment>();
            for(PermissionSet ps:[SELECT Id FROM PermissionSet WHERE Name IN ('SportCompass_Discovery_Read','SportCompass_Program_Matching')])
                assignments.add(new PermissionSetAssignment(AssigneeId=user.Id,PermissionSetId=ps.Id));
            insert assignments;
        }
        Sports_Program__c p=[SELECT Id FROM Sports_Program__c WHERE Name='Youth documented' LIMIT 1];
        insert new Sports_Program__Share(ParentId=p.Id,UserOrGroupId=user.Id,AccessLevel='Read',RowCause='Manual');
        System.runAs(user){
            Test.startTest();MatchSportsProgramsAction.Response response=callOne(request(12));Test.stopTest();
            System.assertEquals('NO_MATCHES',response.status);
            System.assertEquals('[]',response.resultsJson,'Visible child must not expose inaccessible parent names');
        }
    }
}
