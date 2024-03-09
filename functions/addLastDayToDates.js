const parseTimestamp = require("./parseTimestamp");
const Dates = require("../database/schemas/dateSchema");

const addLastDayToDates = (data) => {
  // 86400000
  const now = Date.now() - 86400000;
  const yesterday = `${parseTimestamp(now, "d")}/${parseTimestamp(
    now,
    "m"
  )}/${parseTimestamp(now, "y")}`;
  const hours = [];
  const dataWithTimestamps = data.filter((item) => item.timestamp);

  dataWithTimestamps.forEach((item) => {
    const itemDate = `${parseTimestamp(item.timestamp, "d")}/${parseTimestamp(
      item.timestamp,
      "m"
    )}/${parseTimestamp(item.timestamp, "y")}`;
    if (itemDate === yesterday) {
      hours.push(`${parseTimestamp(item.timestamp, "h")}`);
    }
  });

  const newDate = new Dates({
    x: yesterday,
    y: hours.length,
    hours: hours,
  });

  newDate.save((err, user) => {
    if (err) return console.error(err);
  });
};

module.exports = addLastDayToDates;
