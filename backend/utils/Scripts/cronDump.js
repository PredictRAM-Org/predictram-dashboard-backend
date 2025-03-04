const getScheduledTimeStamp = DateTimeService.getMergeDateAndTimeString(
  date.toISOString(),
  DateTimeService.getISOStringFromTime(fromTime)
);
const scheduledDate = new Date(getScheduledTimeStamp);

// Scheduling 4 hours before the schedule
// scheduledDate.setHours(scheduledDate.getHours() - 4);

// for testing purposes
scheduledDate.setMinutes(scheduledDate.getMinutes() - 3);

const schedule = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${
  scheduledDate.getMonth() + 1
} *`;
const task = cron.schedule(schedule, async () => {
  console.log("Running cron job");
  notifyRegisteredUsers(id);
});
