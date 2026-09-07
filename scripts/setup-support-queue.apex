// Add only the existing builder to the demo queue. Do not enroll the public agent as an operator.
System.assertEquals('00DgL00000c7pj3',String.valueOf(UserInfo.getOrganizationId()).substring(0,15),'Wrong org');
Id queueId=[SELECT Id FROM Group WHERE Type='Queue' AND DeveloperName='SportCompass_Support'].Id;
Id builderId=[SELECT Id FROM User WHERE Username='gpallavi421afg@gmail.com' AND IsActive=true].Id;
if([SELECT COUNT() FROM GroupMember WHERE GroupId=:queueId AND UserOrGroupId=:builderId]==0)
    insert new GroupMember(GroupId=queueId,UserOrGroupId=builderId);
System.debug('Existing builder is a member of the Sport Compass demo support queue.');
