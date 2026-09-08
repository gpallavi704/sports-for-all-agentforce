// Read-only live smoke check. No Agentforce model call or record writes.
List<FindNearbyFencingClubsAction.Request> requests = new List<FindNearbyFencingClubsAction.Request>();
for (Integer radius : new List<Integer>{50,25}) {
    FindNearbyFencingClubsAction.Request request = new FindNearbyFencingClubsAction.Request();
    request.location = '84060'; request.radiusMiles = radius; request.resultLimit = 3;
    requests.add(request);
}
FindNearbyFencingClubsAction.Request para = new FindNearbyFencingClubsAction.Request();
para.location = '84060'; para.radiusMiles = 50; para.weapons = 'Para'; para.resultLimit = 3;
requests.add(para);
List<FindNearbyFencingClubsAction.Response> results = FindNearbyFencingClubsAction.findClubs(requests);
System.assertEquals(3,results.size());
System.assertEquals('LISTINGS',results[0].status,results[0].message);
for (FindNearbyFencingClubsAction.Response result : results) {
    System.assert(new Set<String>{'LISTINGS','NO_LISTINGS'}.contains(result.status),result.message);
    System.debug('PUBLIC_DIRECTORY_CHECK=' + JSON.serialize(result));
}
