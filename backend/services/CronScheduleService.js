class CronScheduleService {
  constructor() {}

  scheduleCron(timeStamp, daysBefore) {
    const scheduledDate = new Date(timeStamp);

    scheduledDate.setDate(scheduledDate.getDate() - daysBefore);

    const schedule = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${
      scheduledDate.getMonth() + 1
    } *`;

    return schedule;
  }
}

module.exports = new CronScheduleService();
