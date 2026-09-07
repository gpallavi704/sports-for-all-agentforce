// Scoped setup: one API-only integration user, no password reset or welcome email.
// Run only in the authorized hackathon org after deploying the app-access marker.
System.assertEquals('00DgL00000c7pj3UAA', String.valueOf(UserInfo.getOrganizationId()), 'Wrong org');
Profile p=[SELECT Id,Name,UserLicense.Name FROM Profile WHERE Name='Minimum Access - API Only Integrations' LIMIT 1];
System.assertEquals('Salesforce Integration',p.UserLicense.Name);
PermissionSet base=[SELECT PermissionsApiEnabled,PermissionsApiUserOnly,PermissionsViewAllData,PermissionsModifyAllData FROM PermissionSet WHERE ProfileId=:p.Id];
System.assert(base.PermissionsApiEnabled && base.PermissionsApiUserOnly && !base.PermissionsViewAllData && !base.PermissionsModifyAllData,'Unexpected profile privileges');
System.assertEquals(0,[SELECT COUNT() FROM ObjectPermissions WHERE Parent.ProfileId=:p.Id AND (PermissionsRead=true OR PermissionsCreate=true OR PermissionsEdit=true OR PermissionsDelete=true)],'Unexpected object grants');
String username='sportcompass.api.00dgl00000c7pj3uaa@example.invalid';
List<User> existing=[SELECT Id,ProfileId,IsActive,UserRoleId FROM User WHERE Username=:username];
User actor;
Boolean created=false;
if(existing.isEmpty()) {
    UserLicense lic=[SELECT TotalLicenses,UsedLicenses FROM UserLicense WHERE Name='Salesforce Integration' LIMIT 1];
    System.assert(lic.UsedLicenses<lic.TotalLicenses,'No integration license available');
    User owner=[SELECT Email FROM User WHERE Id='005gL00000NZX3vQAH'];
    actor=new User(FirstName='Sport Compass',LastName='API Integration',Alias='scapi',
        Username=username,Email=owner.Email,ProfileId=p.Id,IsActive=true,
        EmailEncodingKey='UTF-8',LanguageLocaleKey='en_US',LocaleSidKey='en_US',
        TimeZoneSidKey='America/Los_Angeles',CommunityNickname='scapi00dgl00000c7pj3',
        UserPermissionsMarketingUser=false);
    Database.DMLOptions options=new Database.DMLOptions();
    options.EmailHeader.triggerUserEmail=false;
    options.EmailHeader.triggerOtherEmail=false;
    options.EmailHeader.triggerAutoResponseEmail=false;
    Database.SaveResult result=Database.insert(actor,options);
    System.assert(result.isSuccess(),'API user creation failed; inspect Salesforce setup errors');
    System.assertNotEquals(null,actor.Id,'API user ID was not returned');
    created=true;
} else {
    actor=existing[0];
    System.assertEquals(p.Id,actor.ProfileId,'Existing identity has another profile');
    System.assert(actor.IsActive && actor.UserRoleId==null,'Existing identity needs review');
}
Id marker=[SELECT Id FROM PermissionSet WHERE Name='SportCompass_API_App_Access'].Id;
if([SELECT COUNT() FROM PermissionSetAssignment WHERE AssigneeId=:actor.Id AND PermissionSetId=:marker]==0)
    insert new PermissionSetAssignment(AssigneeId=actor.Id,PermissionSetId=marker);
System.debug(LoggingLevel.ERROR,'SC_API_SETUP '+JSON.serialize(new Map<String,Object>{'userId'=>actor.Id,'created'=>created,'apiOnly'=>true,'emailTriggered'=>false,'genericObjectPermissionsAdded'=>false}));
