class DateTimeService {
  constructor() {}

  getLocalDate = (timeStamp) => {
    const _date = new Date(timeStamp);
    const _dateFormat = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return _date.toLocaleString("default", _dateFormat);
  };

  get12HrTime = (time) => {
    let [hours, minutes] = time.split(":");
    let period = "AM";
    if (hours >= 12) {
      period = "PM";
      hours = hours - 12;
    }
    if (hours === 0) {
      hours = 12;
    }
    return `${hours}:${minutes} ${period}`;
  };

  getISOStringFromTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    const isoString = date.toISOString();
    return isoString;
  };

  getMergeDateAndTimeString = (datestring, timestring) => {
    const [dateComponent] = datestring.split("T");
    const [_, timeComponent] = timestring.split("T");
    return `${dateComponent}T${timeComponent}`;
  };

  get24HrTime = (time) => {
    let [hours, minutes, period] = time.split(":");
    if (period === "PM") {
      hours = parseInt(hours) + 12;
    }
    return `${hours}:${minutes}`;
  };

  addMinutesToTime = (time, minutesToAdd) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + minutesToAdd);
    return `${date.getHours()}:${date.getMinutes()}`;
  };
}

module.exports = new DateTimeService();
