const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

//schema for dates/visits

const dateSchema = new mongoose.Schema({
  x: { type: String, default: null },
  y: { type: Number, default: null },
  hours: { type: Array, default: [] },
});
dateSchema.plugin(mongoosePaginate);
const Dates = mongoose.model("Date", dateSchema);

module.exports = Dates;
