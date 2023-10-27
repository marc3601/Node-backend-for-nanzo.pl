const Dates = require("../database/schemas/dateSchema");
const dates = async (req, res) => {
  res.set("Cache-Control", "public, max-age=600");
  Dates.find((err, dates) => {
    const source = dates.slice(dates.length - 60, dates.length);
    const week = source.slice(source.length - 7, source.length);
    const last_week = source.slice(source.length - 14, source.length - 7);
    const month = source.slice(source.length - 30, source.length);
    const last_month = source.slice(source.length - 60, source.length - 30);
    const result = {
      week,
      last_week,
      month,
      last_month,
    };
    res.send(result);
  });
};

module.exports = dates;
