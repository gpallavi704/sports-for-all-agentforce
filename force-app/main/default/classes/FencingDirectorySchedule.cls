public without sharing class FencingDirectorySchedule implements Schedulable {
    public void execute(SchedulableContext context) {
        FencingDirectorySync.startRefresh();
    }
}
