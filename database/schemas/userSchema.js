const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

//user schema

const userSchema = new mongoose.Schema({
  userIp: String,
  countryName: { type: String, default: null },
  countryFlag: { type: String, default: null },
  isp: { type: String, default: null },
  city: { type: String, default: null },
  timestamp: { type: Number, default: null },
  visitSource: { type: String, default: null },
  entryPage: { type: String, default: null },
  device: { type: mongoose.SchemaTypes.Mixed, default: null },
});
userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);

module.exports = User;
