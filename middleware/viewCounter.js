const Redis = require("redis");
const client = Redis.createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

// Connect once when module loads
client.connect().catch(console.error);

const viewCounter = async (req, res, next) => {
  try {
    // Increment total views
    await client.incr("views");
    
    // Get the URL from request body
    const url = req.body.loc;
    
    if (url) {
      // Create a hash key for this URL (using the URL as key)
      const urlKey = `url:${new URL(url).origin + new URL(url).pathname}`;
      
      // Check if URL exists, if not initialize it
      const exists = await client.exists(urlKey);
      
      if (!exists) {
        // First time seeing this URL - create hash with views: 0
        await client.hSet(urlKey, {
          url: url,
          views: "0"
        });
      }
      
      // Increment views for this specific URL
      await client.hIncrBy(urlKey, "views", 1);
    }
  } catch (error) {
    console.error(error);
  }
  next();
};

module.exports = viewCounter;