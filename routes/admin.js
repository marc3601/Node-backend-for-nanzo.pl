const User = require("../database/schemas/userSchema");
const Redis = require("redis");
const client = Redis.createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

const admin = async (req, res) => {
  res.set("Cache-Control", "no-store");
  let views = 0;
  try {
    await client.connect();
    views = await client.get("views");
    await client.disconnect();
  } catch (error) {
    console.error(error);
  }
  User.find((err, data) => {
    if (err) return console.error(err);
    let userCount = data.length;
    res.render("main", { count: userCount.toString(), live: views });
  });
};

module.exports = admin;
