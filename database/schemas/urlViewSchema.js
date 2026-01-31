const mongoose = require("mongoose");

const urlViewSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  views: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("UrlView", urlViewSchema);