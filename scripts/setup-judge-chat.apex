// Run only in the approved Sport Compass hackathon org.
// Adds one existing license seat and a time-limited operator permission set.
// No passwords, public support membership or org-wide sharing changes.
System.assertEquals('00DgL00000c7pj3UAA', String.valueOf(UserInfo.getOrganizationId()));
User judge = [SELECT Id FROM User WHERE Username = 'sportcompass.judge.2026@00dgl00000c7pj3uaa.example.invalid' AND IsActive = true LIMIT 1];
PermissionSet operator = [SELECT Id FROM PermissionSet WHERE Name = 'SportCompass_Judge_Operator' LIMIT 1];
ServicePresenceStatus presence = [SELECT Id FROM ServicePresenceStatus WHERE DeveloperName = 'SportCompass_Judge_Available' LIMIT 1];
Group judgeQueue = [SELECT Id FROM Group WHERE DeveloperName = 'SportCompass_Judge_Queue' AND Type = 'Queue' LIMIT 1];
Group publicQueue = [SELECT Id FROM Group WHERE DeveloperName = 'SportCompass_Web_Fallback' AND Type = 'Queue' LIMIT 1];
System.assertEquals(1, [SELECT count() FROM GroupMember WHERE GroupId = :judgeQueue.Id AND UserOrGroupId = :judge.Id]);
System.assertEquals(0, [SELECT count() FROM GroupMember WHERE GroupId = :publicQueue.Id AND UserOrGroupId = :judge.Id]);
System.assertEquals(0, [SELECT count() FROM ObjectPermissions WHERE ParentId = :operator.Id AND (PermissionsEdit = true OR PermissionsCreate = true OR PermissionsDelete = true OR PermissionsViewAllRecords = true OR PermissionsModifyAllRecords = true)]);
PermissionSetLicense chatLicense = [SELECT Id, TotalLicenses, UsedLicenses FROM PermissionSetLicense WHERE DeveloperName = 'EmbeddedServiceMessagingUserPsl' AND Status = 'Active' LIMIT 1];
if ([SELECT count() FROM PermissionSetLicenseAssign WHERE AssigneeId = :judge.Id AND PermissionSetLicenseId = :chatLicense.Id] == 0) {
    System.assert(chatLicense.UsedLicenses < chatLicense.TotalLicenses, 'No existing Enhanced Chat seat is available. Do not purchase a license automatically.');
    insert new PermissionSetLicenseAssign(AssigneeId = judge.Id, PermissionSetLicenseId = chatLicense.Id);
}
if ([SELECT count() FROM SetupEntityAccess WHERE ParentId = :operator.Id AND SetupEntityId = :presence.Id] == 0) {
    insert new SetupEntityAccess(ParentId = operator.Id, SetupEntityId = presence.Id);
}
Datetime expiresAt = Datetime.newInstanceGMT(2026, 9, 23, 6, 59, 59);
System.assert(expiresAt > System.now(), 'Judging access period has ended.');
List<PermissionSetAssignment> assignments = [SELECT Id, ExpirationDate FROM PermissionSetAssignment WHERE AssigneeId = :judge.Id AND PermissionSetId = :operator.Id];
if (assignments.isEmpty()) {
    insert new PermissionSetAssignment(AssigneeId = judge.Id, PermissionSetId = operator.Id, ExpirationDate = expiresAt);
} else {
    assignments[0].ExpirationDate = expiresAt;
    update assignments[0];
}
System.debug('Judge operator setup complete. Operator assignment expires at the end of September 22 Pacific. Public queue unchanged.');
