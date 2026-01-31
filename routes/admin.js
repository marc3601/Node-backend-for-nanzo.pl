const User = require("../database/schemas/userSchema");
const Redis = require("redis");
const client = Redis.createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

// Connect once when the module loads
client.connect().catch(console.error);

const admin = async (req, res) => {
  res.set("Cache-Control", "no-store");
  
  try {
    // Get views from Redis 
    const views = await client.get("views") || "0";
    
    // Get user count from MongoDB
    const data = await User.find();
    const userCount = data.length;
    
    res.render("main", { 
      count: userCount.toString(), 
      live: views 
    });
  } catch (error) {
    console.error(error);
    res.render("main", { 
      count: "0", 
      live: "0" 
    });
  }
};

module.exports = admin;