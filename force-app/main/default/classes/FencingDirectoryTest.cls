@IsTest
private class FencingDirectoryTest {
    private static Boolean searchTestStarted = false;
    private class SourceMock implements HttpCalloutMock {
        Integer status;
        Boolean broken;
        SourceMock(Integer status, Boolean broken) { this.status=status; this.broken=broken; }
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response=new HttpResponse(); response.setStatusCode(status);
            if (request.getEndpoint().startsWith('https://api.zippopotam.us/us/')) {
                response.setBody(broken?'{}':'{"post code":"84060","country abbreviation":"US","places":[{"latitude":"40.6524","longitude":"-111.5018"}]}');
            } else {
                System.assertEquals('application/json',request.getHeader('Accept'));
                response.setBody(broken?'{}':pageBody(1,false,1001));
            }
            return response;
        }
    }
    private static Map<String,Object> source(Integer id) {
        return new Map<String,Object>{
            'id'=>id,'name'=>'Test Public Club '+id,'inactive'=>0,
            'routes'=>new Map<String,Object>{'show'=>'https://member.usafencing.org/clubs/test-'+id},
            'website'=>'https://example.org/',
            'publicAddress'=>new Map<String,Object>{'city'=>'Park City','state'=>'UT','zip'=>'84060','country'=>'US',
                'full_street_address'=>'Test public venue','lat'=>'40.6524','lng'=>'-111.5018'},
            'specialties'=>new List<String>{'Epee','Para'},'division'=>new Map<String,Object>{'label'=>'Test'}
        };
    }
    private static String pageBody(Integer page,Boolean more,Integer id) {
        return JSON.serialize(new Map<String,Object>{'indexData'=>new Map<String,Object>{
            'models'=>new List<Object>{source(id)},
            'pages'=>new Map<String,Object>{'current'=>page,'hasMorePages'=>more,'next'=>page+1}
        }});
    }
    @TestSetup static void setup() {
        PermissionSet readAccess = [SELECT Id FROM PermissionSet WHERE Name='SportCompass_Public_Club_Search' LIMIT 1];
        User reader=new User(Alias='scdir',Email='scdir@example.invalid',EmailEncodingKey='UTF-8',
            LastName='DirectoryTestReader',LanguageLocaleKey='en_US',LocaleSidKey='en_US',
            ProfileId=[SELECT Id FROM Profile WHERE Name='Minimum Access - Salesforce' LIMIT 1].Id,TimeZoneSidKey='America/Los_Angeles',
            Username='scdir.'+UserInfo.getOrganizationId()+'@example.invalid');
        insert as system reader;
        insert as system new PermissionSetAssignment(AssigneeId=reader.Id,PermissionSetId=readAccess.Id);
        System.runAs(new User(Id=UserInfo.getUserId())) {
        insert as system new List<Fencing_Club_Directory__c>{
            club('1','Near Para',40.6524,-111.5018,'Epee;Para',true),
            club('2','Nearby Foil',40.75,-111.5018,'Foil',true),
            club('3','Far Club',42,-111.5018,'Para',true),
            club('4','Inactive',40.6524,-111.5018,'Para',false)
        };
        }
    }
    private static Fencing_Club_Directory__c club(String id,String name,Decimal lat,Decimal lng,String weapons,Boolean active) {
        return new Fencing_Club_Directory__c(Source_Id__c=id,Club_Name__c=name,Location__Latitude__s=lat,
            Location__Longitude__s=lng,Weapons__c=weapons,Para_Listed__c=weapons.contains('Para'),
            Active__c=active,Country__c='US',Last_Synced_At__c=System.now(),
            Source_URL__c='https://member.usafencing.org/clubs/test-'+id);
    }
    private static FindNearbyFencingClubsAction.Request input() {
        FindNearbyFencingClubsAction.Request request=new FindNearbyFencingClubsAction.Request();
        request.location='84060'; request.radiusMiles=25; return request;
    }
    private static FindNearbyFencingClubsAction.Response search(FindNearbyFencingClubsAction.Request request) {
        User reader=[SELECT Id FROM User WHERE LastName='DirectoryTestReader' LIMIT 1];
        FindNearbyFencingClubsAction.Response result;
        System.runAs(reader) {
            if (!searchTestStarted) { Test.startTest(); searchTestStarted = true; }
            result = FindNearbyFencingClubsAction.findClubs(new List<FindNearbyFencingClubsAction.Request>{request})[0];
        }
        return result;
    }
    @IsTest static void radiusAndFilters() {
        Test.setMock(HttpCalloutMock.class,new SourceMock(200,false));
        FindNearbyFencingClubsAction.Request request=input();
        FindNearbyFencingClubsAction.Response response=search(request);
        System.assertEquals('LISTINGS',response.status);
        System.assertEquals(2,((List<Object>)JSON.deserializeUntyped(response.resultsJson)).size());
        Map<String,Object> structured=(Map<String,Object>)JSON.deserializeUntyped(response.structuredResultJson);
        System.assertEquals('1.0',structured.get('schemaVersion'));
        System.assertEquals('LISTINGS',structured.get('status'));
        System.assertEquals('straight_line_from_zip_center',structured.get('distanceBasis'));
        System.assertEquals(2,((List<Object>)structured.get('clubs')).size());
        Map<String,Object> firstClub=(Map<String,Object>)((List<Object>)structured.get('clubs'))[0];
        System.assertEquals('1',firstClub.get('clubId'));
        System.assertEquals('Contact the club to confirm access and equipment.',firstClub.get('accessibilityNote'));
        System.assertEquals(null,firstClub.get('websiteUrl'));
        System.assert(((String)structured.get('fallbackText')).contains('Near Para'));
        System.assert(!response.resultsJson.contains('Far Club'));
        System.assert(!response.resultsJson.contains('Inactive'));
        request.weapons='Para';
        response=search(request);
        System.assertEquals(1,((List<Object>)JSON.deserializeUntyped(response.resultsJson)).size());
        System.assert(response.resultsJson.contains('Near Para'));
        System.assert(response.message.contains('not driving'));
        request.weapons='Saber';
        System.assertEquals('NO_LISTINGS',search(request).status);
        request.weapons='Para,Foil'; request.resultLimit=1;
        System.assertEquals(true,search(request).hasMore);
        System.assertEquals(1,Limits.getCallouts(),'Identical ZIP reused only within invocation transaction.');
        Test.stopTest();
    }
    @IsTest static void validatesInputs() {
        FindNearbyFencingClubsAction.Request request=input();
        request.location='Park City, Utah';
        FindNearbyFencingClubsAction.Response needsZip=search(request);
        System.assertEquals('NEEDS_ZIP',needsZip.status);
        System.assertEquals('NEEDS_ZIP',((Map<String,Object>)JSON.deserializeUntyped(needsZip.structuredResultJson)).get('status'));
        request.location='84060'; request.radiusMiles=26;
        System.assertEquals('INVALID_INPUT',search(request).status);
        request.radiusMiles=25; request.weapons='Para OR private';
        System.assertEquals('INVALID_INPUT',search(request).status);
        request.weapons=null; request.resultLimit=11;
        System.assertEquals('INVALID_INPUT',search(request).status);
        System.assertEquals(0,FindNearbyFencingClubsAction.findClubs(null).size());
        System.assertEquals(0,Limits.getCallouts());
        Test.stopTest();
    }
    @IsTest static void upstreamFailure() {
        Test.setMock(HttpCalloutMock.class,new SourceMock(503,false));
        System.assertEquals('LOCATION_UNAVAILABLE',search(input()).status);
        Test.stopTest();
    }
    @IsTest static void malformedGeocoder() {
        Test.setMock(HttpCalloutMock.class,new SourceMock(200,true));
        System.assertEquals('LOCATION_UNAVAILABLE',search(input()).status);
        Test.stopTest();
    }
    @IsTest static void staleData() {
        List<Fencing_Club_Directory__c> rows=[SELECT Id,Last_Synced_At__c FROM Fencing_Club_Directory__c WITH SYSTEM_MODE];
        for(Fencing_Club_Directory__c row:rows) row.Last_Synced_At__c=System.now().addDays(-8);
        update as system rows;
        System.assertEquals('STALE_DIRECTORY',search(input()).status);
        System.assertEquals(0,Limits.getCallouts());
        Test.stopTest();
    }
    @IsTest static void missingDirectory() {
        delete as system [SELECT Id FROM Fencing_Club_Directory__c WITH SYSTEM_MODE];
        System.assertEquals('DIRECTORY_UNAVAILABLE',search(input()).status);
        Test.stopTest();
    }
    @IsTest static void normalizationAndUrls() {
        Fencing_Club_Directory__c row=FencingDirectorySync.normalize(source(9));
        System.assertEquals(true,row.Para_Listed__c);
        System.assertEquals('Epee;Para',row.Weapons__c);
        System.assertEquals(null,FencingDirectorySync.safeUrl('javascript:alert(1)',false));
        System.assertEquals(null,FencingDirectorySync.safeUrl('https://example.org/a?token=secret',false));
        System.assertEquals(null,FencingDirectorySync.safeUrl('https://example.org/clubs/a',true));
        System.assertEquals(null,FencingDirectorySync.safeUrl('https://user:pass@example.org/',false));
        Map<String,Object> bad=source(10); bad.put('inactive','unknown');
        try { FencingDirectorySync.normalize(bad); System.assert(false); }
        catch(FencingDirectorySync.DirectoryException expected) {}
    }
    @IsTest static void paginationValidation() {
        Map<String,Fencing_Club_Directory__c> snapshot=new Map<String,Fencing_Club_Directory__c>();
        System.assertEquals(true,FencingDirectorySync.consumePage(pageBody(1,true,10),1,snapshot));
        System.assertEquals(false,FencingDirectorySync.consumePage(pageBody(2,false,11),2,snapshot));
        System.assertEquals(2,snapshot.size());
        try { FencingDirectorySync.consumePage(pageBody(2,false,11),2,snapshot); System.assert(false); }
        catch(FencingDirectorySync.DirectoryException expected) {}
        try { FencingDirectorySync.consumePage(pageBody(1,false,12),3,snapshot); System.assert(false); }
        catch(FencingDirectorySync.DirectoryException expected) {}
    }
    @IsTest static void publishesWholeSnapshot() {
        Club_Directory_Sync__c control=new Club_Directory_Sync__c(Directory_Key__c='USA_FENCING',Record_Count__c=2);
        insert as system control;
        Map<String,Fencing_Club_Directory__c> snapshot=new Map<String,Fencing_Club_Directory__c>{
            '1'=>FencingDirectorySync.normalize(source(1))};
        FencingDirectorySync.publishSnapshot(snapshot,control);
        System.assertEquals('SUCCEEDED',[SELECT Status__c FROM Club_Directory_Sync__c WHERE Id=:control.Id WITH SYSTEM_MODE].Status__c);
        System.assertEquals(1,[SELECT count() FROM Fencing_Club_Directory__c WHERE Active__c=true WITH SYSTEM_MODE]);
        System.assertEquals(4,[SELECT count() FROM Fencing_Club_Directory__c WITH SYSTEM_MODE],'Missing records are deactivated, not deleted.');
        try { FencingDirectorySync.publishSnapshot(new Map<String,Fencing_Club_Directory__c>(),control); System.assert(false); }
        catch(FencingDirectorySync.DirectoryException expected) {}
    }
    @IsTest static void syncSuccess() {
        Test.setMock(HttpCalloutMock.class,new SourceMock(200,false));
        Test.startTest(); FencingDirectorySync.startRefresh(); Test.stopTest();
        System.assertEquals('SUCCEEDED',[SELECT Status__c FROM Club_Directory_Sync__c WITH SYSTEM_MODE].Status__c);
        System.assertEquals(1,[SELECT count() FROM Fencing_Club_Directory__c WHERE Source_Id__c='1001' WITH SYSTEM_MODE]);
    }
    @IsTest static void failedSyncPreservesData() {
        Test.setMock(HttpCalloutMock.class,new SourceMock(503,false));
        Test.startTest(); FencingDirectorySync.startRefresh(); Test.stopTest();
        System.assertEquals('FAILED',[SELECT Status__c FROM Club_Directory_Sync__c WITH SYSTEM_MODE].Status__c);
        System.assertEquals(3,[SELECT count() FROM Fencing_Club_Directory__c WHERE Active__c=true WITH SYSTEM_MODE]);
    }
    @IsTest static void concurrentSyncBlocked() {
        insert as system new Club_Directory_Sync__c(Directory_Key__c='USA_FENCING',Status__c='RUNNING',Started_At__c=System.now());
        try { FencingDirectorySync.startRefresh(); System.assert(false); }
        catch(FencingDirectorySync.DirectoryException expected) {}
    }
    @IsTest static void scheduleCanBeCreated() {
        Test.startTest();
        String id=System.schedule('Directory unit test','0 0 3 * * ?',new FencingDirectorySchedule());
        System.assertNotEquals(null,id);
        System.abortJob(id);
        Test.setMock(HttpCalloutMock.class,new SourceMock(200,false));
        new FencingDirectorySchedule().execute(null);
        Test.stopTest();
    }
}
