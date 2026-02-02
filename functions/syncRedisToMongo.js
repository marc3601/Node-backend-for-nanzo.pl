const Redis = require("redis");
const UrlView = require("../database/schemas/urlViewSchema");

const client = Redis.createClient();
let isRedisConnected = false;

client.on("error", (err) => {
  console.log("Redis Client Error", err.message);
  isRedisConnected = false;
});

client.on("connect", () => {
  console.log("Redis connected successfully");
  isRedisConnected = true;
});

client.connect().catch((err) => {
  console.error("Failed to connect to Redis:", err.message);
});

const syncRedisToMongo = async () => {
  if (!isRedisConnected) {
    return;
  }

  try {
    const keys = await client.keys("url:*");
    
    for (const key of keys) {
      const data = await client.hGetAll(key);
      
      if (data.url && data.views) {
        const redisViews = parseInt(data.views);
        const existingDoc = await UrlView.findOne({ url: data.url });
        
        if (!existingDoc || existingDoc.views !== redisViews) {
          await UrlView.findOneAndUpdate(
            { url: data.url },
            { views: redisViews },
            { upsert: true, new: true }
          );
        }
      }
    }
  } catch (error) {
    console.error("Error syncing Redis to MongoDB:", error);
  }
};

setInterval(syncRedisToMongo, 600000); // Every 10 minutes
setTimeout(syncRedisToMongo, 5000);

module.exports = syncRedisToMongo;