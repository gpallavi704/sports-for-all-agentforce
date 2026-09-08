// Run as the org administrator after deploying and testing the directory package.
// Idempotent schedule creation. Does not alter other scheduled jobs.
String scheduleName = 'Sport Compass Club Directory Refresh';
List<CronTrigger> jobs = [
    SELECT Id FROM CronTrigger WHERE CronJobDetail.Name = :scheduleName
    AND State IN ('WAITING','ACQUIRED','EXECUTING','PAUSED','BLOCKED','PAUSED_BLOCKED')
];
if (jobs.isEmpty()) {
    System.schedule(scheduleName, '0 0 3 * * ?', new FencingDirectorySchedule());
}
System.debug('DIRECTORY_REFRESH_JOB=' + FencingDirectorySync.startRefresh());
System.debug('SCHEDULE_TIMEZONE=' + UserInfo.getTimeZone().getID());
