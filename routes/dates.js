const Dates = require("../database/schemas/dateSchema");
const dates = async (req, res) => {
  res.set("Cache-Control", "public, max-age=600");
  Dates.find((err, dates) => {
    try {
      const all = dates.slice(1);
      const source = dates.slice(dates.length - 60, dates.length);
      const week = source.slice(source.length - 7, source.length);
      const last_week = source.slice(source.length - 14, source.length - 7);
      const month = source.slice(source.length - 30, source.length);
      const last_month = source.slice(source.length - 60, source.length - 30);

      function sumYValuesByMonthYear(data) {
        const sums = {};
        data.forEach((item) => {
          const date = item.x.split("/");
          const monthYear = `${date[1]}/${date[2]}`;
          if (!sums[monthYear]) {
            sums[monthYear] = 0;
          }
          sums[monthYear] += item.y;
        });
        return sums;
      }

      const monthly = sumYValuesByMonthYear(all);

      const result = {
        week,
        last_week,
        month,
        last_month,
        monthly,
      };

      res.send(result);
    } catch (error) {
      res.sendStatus(500);
    }
  });
};

module.exports = dates;
