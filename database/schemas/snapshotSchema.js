const mongoose = require("mongoose");

const snapshotItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },       // auction item id (e.g. "maximus-ogrzewana-jedyna-w-pl")
    viewcount: { type: Number, required: true }, // viewcount at the moment of reset
  },
  { _id: false }
);

const snapshotSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  items: [snapshotItemSchema],
});

module.exports = mongoose.model("Snapshot", snapshotSchema);