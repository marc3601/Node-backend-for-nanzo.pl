const mongoose = require("mongoose");
// Database

const connectDatabase = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/images", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((e) => console.error(e.message));
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("Database connected");
  });
};

module.exports = connectDatabase;
