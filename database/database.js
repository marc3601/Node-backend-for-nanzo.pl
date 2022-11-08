const mongoose = require("mongoose");
// Database

const connectDatabase = () => {
  mongoose.connect("mongodb://localhost:27017/images", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("Database connected");
  });
};

module.exports = connectDatabase;
