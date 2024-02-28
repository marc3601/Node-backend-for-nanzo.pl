const Redis = require("redis");
const client = Redis.createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

const viewCounter = async (req, res, next) => {
  try {
    await client.connect();
    const views = await client.get("views");
    if (views === null) {
      await client.set("views", "0");
    } else {
      let current = Number(views);
      let incremented = (current += 1);
      let newViewsCount = String(incremented);
      await client.set("views", newViewsCount);
    }
    await client.disconnect();
  } catch (error) {
    console.error(error);
  }
  next();
};

module.exports = viewCounter;
