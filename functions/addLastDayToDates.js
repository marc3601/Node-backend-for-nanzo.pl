const parseTimestamp = require("./parseTimestamp");
const Dates = require("../database/schemas/dateSchema");

const addLastDayToDates = (data) => {
  // 86400000
  const now = Date.now() - 86400000;
  const yesterday = `${parseTimestamp(now, "d")}/${parseTimestamp(
    now,
    "m"
  )}/${parseTimestamp(now, "y")}`;
  const dataWithTimestamps = data.filter((item) => item.timestamp);
  const arrayOfDates = dataWithTimestamps.map((item) => {
    return `${parseTimestamp(item.timestamp, "d")}/${parseTimestamp(
      item.timestamp,
      "m"
    )}/${parseTimestamp(item.timestamp, "y")}`;
  });

  const datesFromYesterday = arrayOfDates.filter((item) => item === yesterday);
  const newDate = new Dates({
    x: yesterday,
    y: datesFromYesterday.length,
  });

  newDate.save((err, user) => {
    if (err) return console.error(err);
  });
};

module.exports = addLastDayToDates;
