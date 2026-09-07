// Idempotent org-local setup. Never print/export the signing key or rotate an existing key here.
System.assertEquals('00DgL00000c7pj3',String.valueOf(UserInfo.getOrganizationId()).substring(0,15),'Wrong hackathon org');
SportCompass_Security__c config=SportCompass_Security__c.getOrgDefaults();
if(config.Id==null){
    config=new SportCompass_Security__c(SetupOwnerId=UserInfo.getOrganizationId(),Signing_Key__c=EncodingUtil.base64Encode(Crypto.generateAesKey(256)));
    insert config;
} else {
    System.assert(!String.isBlank(config.Signing_Key__c),'Existing configuration has no key; stop for administrator review');
}
System.debug('Sport Compass support signing configuration is present. Secret omitted.');
