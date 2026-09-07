@IsTest
private class FindPublicFencingClubsActionTest {
    private static Public_Fencing_Club__mdt listing(String name, String city) {
        return new Public_Fencing_Club__mdt(Club_Name__c=name, City__c=city, State__c='UT',
            Website__c='https://www.saltcityswords.com/',
            Source_URL__c='https://www.usafencingutah.com/utah-idaho-clubs',
            Source_Checked_On__c=Date.today(), Enabled__c=true);
    }
    private static FindPublicFencingClubsAction.Request request(String city, String state) {
        FindPublicFencingClubsAction.Request r = new FindPublicFencingClubsAction.Request();
        r.city=city; r.state=state; return r;
    }
    @IsTest static void returnsOnlyPublicClubFactsAndUnknowns() {
        FindPublicFencingClubsAction.testListings = new List<Public_Fencing_Club__mdt>{listing('Test club','Salt Lake City')};
        Test.startTest();
        FindPublicFencingClubsAction.Response r = FindPublicFencingClubsAction.findClubs(
            new List<FindPublicFencingClubsAction.Request>{request(' salt lake city ','ut')})[0];
        System.assertEquals(0, Limits.getDmlStatements());
        System.assertEquals(0, Limits.getCallouts());
        Test.stopTest();
        System.assertEquals('LISTINGS',r.status);
        Map<String,Object> row = (Map<String,Object>)((List<Object>)JSON.deserializeUntyped(r.resultsJson))[0];
        System.assertEquals(false,row.get('isDemo'));
        System.assertEquals('public_club_listing',row.get('recordType'));
        System.assertEquals('Unknown; confirm with the club.',row.get('mobilityAccess'));
        System.assertEquals('Unknown; confirm with the club.',row.get('adaptiveEquipment'));
        System.assertEquals('Unknown; confirm with the club.',row.get('parafencingAvailability'));
        System.assert(!row.containsKey('programId'));
        System.assert(!row.containsKey('Id'));
    }
    @IsTest static void rejectsUnreviewedStaleFutureDisabledAndUnsafeLinks() {
        List<Public_Fencing_Club__mdt> rows = new List<Public_Fencing_Club__mdt>();
        for(Integer i=0;i<7;i++) rows.add(listing('Rejected '+i,'Salt Lake City'));
        rows[0].Enabled__c=false;
        rows[1].Source_Checked_On__c=Date.today().addDays(-91);
        rows[2].Source_Checked_On__c=Date.today().addDays(1);
        rows[3].Source_Checked_On__c=null;
        rows[4].Source_URL__c='https://example.invalid/';
        rows[5].Website__c='https://www.saltcityswords.com/?user=private';
        rows[6].Club_Name__c=null;
        rows.add(null);
        FindPublicFencingClubsAction.testListings=rows;
        System.assertEquals('NO_LISTINGS', FindPublicFencingClubsAction.findClubs(
            new List<FindPublicFencingClubsAction.Request>{request('Salt Lake City','UT')})[0].status);
    }
    @IsTest static void noSilentGeographicExpansionOrFabrication() {
        FindPublicFencingClubsAction.testListings=new List<Public_Fencing_Club__mdt>{listing('Kaysville club','Kaysville')};
        List<FindPublicFencingClubsAction.Response> r=FindPublicFencingClubsAction.findClubs(
            new List<FindPublicFencingClubsAction.Request>{request('Salt Lake City','UT'),request('Kaysville','ID'),request('Kaysville','UT')});
        System.assertEquals('NO_LISTINGS',r[0].status);
        System.assertEquals('[]',r[0].resultsJson);
        System.assert(r[0].message.contains('does not mean no clubs'));
        System.assertEquals('NO_LISTINGS',r[1].status);
        System.assertEquals('LISTINGS',r[2].status);
    }
    @IsTest static void validatesInputsAndBatchSize() {
        System.assertEquals(0,FindPublicFencingClubsAction.findClubs(null).size());
        List<FindPublicFencingClubsAction.Request> requests=new List<FindPublicFencingClubsAction.Request>{
            null,request('','UT'),request('X','Utah'),request('X',''),request('X'.repeat(81),'UT')};
        for(FindPublicFencingClubsAction.Response r:FindPublicFencingClubsAction.findClubs(requests)) System.assertEquals('INVALID_INPUT',r.status);
        requests.clear();
        for(Integer i=0;i<26;i++) requests.add(request('Salt Lake City','UT'));
        for(FindPublicFencingClubsAction.Response r:FindPublicFencingClubsAction.findClubs(requests)) System.assertEquals('INVALID_INPUT',r.status);
    }
    @IsTest static void capsDeduplicatesAndSortsResults() {
        FindPublicFencingClubsAction.testListings=new List<Public_Fencing_Club__mdt>{
            listing('D','Salt Lake City'),listing('A','Salt Lake City'),listing('B','Salt Lake City'),listing('C','Salt Lake City'),listing('A','Salt Lake City')};
        List<Object> rows=(List<Object>)JSON.deserializeUntyped(FindPublicFencingClubsAction.findClubs(
            new List<FindPublicFencingClubsAction.Request>{request('Salt Lake City','UT')})[0].resultsJson);
        System.assertEquals(3,rows.size());
        System.assertEquals('A',((Map<String,Object>)rows[0]).get('name'));
        System.assertEquals('C',((Map<String,Object>)rows[2]).get('name'));
    }
    @IsTest static void installedConfigurationContainsReviewedSources() {
        Map<String,Public_Fencing_Club__mdt> configured=Public_Fencing_Club__mdt.getAll();
        System.assertEquals('Salt Lake City',configured.get('Salt_City_Swords').City__c);
        System.assertEquals('Kaysville',configured.get('Wasatch_Fencing').City__c);
        // Exercise actual metadata access; expiry must not make the test date-dependent.
        System.assertNotEquals(null,FindPublicFencingClubsAction.findClubs(
            new List<FindPublicFencingClubsAction.Request>{request('Salt Lake City','UT')})[0].status);
    }
    @IsTest static void bindsEachCurrentMessageInsteadOfStaleCity() {
        FindPublicFencingClubsAction.testListings = new List<Public_Fencing_Club__mdt>{
            listing('Salt Lake club','Salt Lake City'),listing('Wasatch club','Kaysville')};
        FindPublicFencingClubsAction.Request r=request('Salt Lake City','UT');
        r.latestUserMessage='What about real clubs in Kaysville, UT? Please check that city instead.';
        String result=FindPublicFencingClubsAction.findClubs(new List<FindPublicFencingClubsAction.Request>{r})[0].resultsJson;
        System.assert(result.contains('Wasatch club'));
        System.assert(!result.contains('Salt Lake club'));
        r.latestUserMessage='What about another club?';
        System.assertEquals('INVALID_INPUT',FindPublicFencingClubsAction.findClubs(new List<FindPublicFencingClubsAction.Request>{r})[0].status);
    }
    @IsTest static void parsesExplicitLocationsAndRejectsAmbiguity() {
        for(String message:new List<String>{'What about Kaysville, Utah?','How about Kaysville, UT?','And Kaysville, Utah?'}) {
            System.assertEquals('Kaysville',FindPublicFencingClubsAction.locationFromMessage(message).city);
        }
        for(String message:new List<String>{
            'Find beginner wheelchair fencing programs in Salt Lake City, Utah. I need mobility access.',
            'Switch back to REAL clubs in Salt Lake City, UT, not fictional programs.',
            'Salt Lake City, UT', 'Find clubs near Salt Lake City, UT.'}) {
            FindPublicFencingClubsAction.Request r=FindPublicFencingClubsAction.locationFromMessage(message);
            System.assertNotEquals(null,r,message);
            System.assertEquals('Salt Lake City',r.city,message);
            System.assertEquals('UT',r.state,message);
        }
        System.assertEquals('Atlantis',FindPublicFencingClubsAction.locationFromMessage('Find clubs in Atlantis, ZZ.').city);
        System.assertEquals(null,FindPublicFencingClubsAction.locationFromMessage('Compare clubs in Kaysville, UT and in Salt Lake City, UT.'));
        System.assertEquals(null,FindPublicFencingClubsAction.locationFromMessage('Kaysville'));
        System.assertEquals(null,FindPublicFencingClubsAction.locationFromMessage(''));
        System.assertEquals(null,FindPublicFencingClubsAction.locationFromMessage('x'.repeat(4501)));
    }
    @IsTest static void shortFollowupFindsListingWithoutReusingOldCity() {
        FindPublicFencingClubsAction.testListings=new List<Public_Fencing_Club__mdt>{listing('Wasatch','Kaysville')};
        FindPublicFencingClubsAction.Request r=request('Salt Lake City','UT');
        r.latestUserMessage='What about Kaysville, Utah?';
        System.assertEquals('LISTINGS',FindPublicFencingClubsAction.findClubs(new List<FindPublicFencingClubsAction.Request>{r})[0].status);
        r.latestUserMessage='What about Atlantis, ZZ?';
        System.assertEquals('NO_LISTINGS',FindPublicFencingClubsAction.findClubs(new List<FindPublicFencingClubsAction.Request>{r})[0].status);
        System.assertEquals(null,FindPublicFencingClubsAction.locationFromMessage('What about Kaysville?'));
    }
    @IsTest static void emailHandoffIsFixedAndNeverSends() {
        Integer writes=Limits.getDmlStatements(),calls=Limits.getCallouts();
        Map<String,Object> contact=FindPublicFencingClubsAction.emailHandoff('https://www.saltcityswords.com/');
        if(Date.today()>=Date.newInstance(2026,9,7)&&Date.today()<=Date.newInstance(2026,12,6)) {
            System.assertEquals(System.Label.SportCompass_Demo_Email.trim(),contact.get('recipient'));
            String url=(String)contact.get('mailtoUrl');
            System.assert(url.startsWith('mailto:'+System.Label.SportCompass_Demo_Email.trim()+'?subject='));
            System.assertEquals(true,contact.get('isDemo'));
            System.assert(url.contains('&body=Hello%2C%20'));
            System.assert(!url.contains('&cc=')&&!url.contains('&bcc='));
        } else System.assertEquals(null,contact);
        System.assertEquals(null,FindPublicFencingClubsAction.emailHandoff('https://evil.example/'));
        System.assertEquals(writes,Limits.getDmlStatements());System.assertEquals(calls,Limits.getCallouts());
    }
    @IsTest static void emailReferenceRefreshesOnlyOnePublicSelection() {
        FindPublicFencingClubsAction.testListings=new List<Public_Fencing_Club__mdt>{listing('Wasatch','Kaysville')};
        FindPublicFencingClubsAction.Request r=request('Salt Lake City','UT');
        r.previousResultsJson='[{"recordType":"public_club_listing","isDemo":false,"city":"Kaysville","state":"UT","recipient":"evil@example.invalid"}]';
        r.latestUserMessage='Help me email this club about trying wheelchair fencing.';
        FindPublicFencingClubsAction.Response result=FindPublicFencingClubsAction.findClubs(new List<FindPublicFencingClubsAction.Request>{r})[0];
        System.assertEquals('LISTINGS',result.status);System.assert(!result.resultsJson.contains('evil@'));
        r.latestUserMessage='What about Atlantis, ZZ?';
        System.assertEquals('NO_LISTINGS',FindPublicFencingClubsAction.findClubs(new List<FindPublicFencingClubsAction.Request>{r})[0].status);
        r.latestUserMessage='email this club';r.previousResultsJson='[]';
        System.assertEquals('INVALID_INPUT',FindPublicFencingClubsAction.findClubs(new List<FindPublicFencingClubsAction.Request>{r})[0].status);
    }
}
