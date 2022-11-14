const mongoose = require("mongoose");

//schema for users per day data

const dateSchema = new mongoose.Schema({
  x: { type: String, default: null },
  y: { type: Number, default: null },
});

const Dates = mongoose.model("Date", dateSchema);

module.exports = Dates;
