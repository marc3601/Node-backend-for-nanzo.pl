const User = require("../database/schemas/userSchema");
const admin = async (req, res) => {
  res.set("Cache-Control", "no-store");
  User.find((err, data) => {
    if (err) return console.error(err);
    let userCount = data.length;
    res.render("main", { count: userCount.toString() });
  });
};

module.exports = admin;
