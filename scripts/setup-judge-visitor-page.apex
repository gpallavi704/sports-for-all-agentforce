// Publish only the controller-free judge self-test page on the existing Site.
// No guest object or Apex class permissions are granted.
System.assertEquals('00DgL00000c7pj3UAA', String.valueOf(UserInfo.getOrganizationId()));
Site publicSite = [SELECT Id, GuestUserId FROM Site WHERE Name = 'SportCompass_Public' LIMIT 1];
User guest = [SELECT ProfileId, UserType FROM User WHERE Id = :publicSite.GuestUserId LIMIT 1];
System.assertEquals('Guest', guest.UserType);
PermissionSet guestProfilePermissions = [SELECT Id FROM PermissionSet WHERE ProfileId = :guest.ProfileId AND IsOwnedByProfile = true LIMIT 1];
System.assertEquals(0, [SELECT count() FROM ObjectPermissions WHERE ParentId = :guestProfilePermissions.Id]);
ApexPage judgePage = [SELECT Id, ControllerType, ControllerKey FROM ApexPage WHERE Name = 'SportCompassJudgeDemo' LIMIT 1];
System.assert(String.isBlank(judgePage.ControllerKey), 'Do not expose a controller-backed page to the Site guest.');
if ([SELECT count() FROM SetupEntityAccess WHERE ParentId = :guestProfilePermissions.Id AND SetupEntityId = :judgePage.Id] == 0) {
    insert new SetupEntityAccess(ParentId = guestProfilePermissions.Id, SetupEntityId = judgePage.Id);
}
System.debug('Judge visitor page enabled. Guest CRM object permissions unchanged.');
