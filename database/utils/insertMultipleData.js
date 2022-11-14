const Dates = require("../schemas/dateSchema");

const insertMultipleData = (data) => {
  Dates.insertMany(data, (err, docs) => {
    if (err) return console.error(err);
    console.log("Insert sucess");
  });
};

module.exports = insertMultipleData;
