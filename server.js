const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "upload/" });
const app = express();
const port = 8080;
const cors = require("cors");
const requestIp = require("request-ip");
const IMAGES = "/upload";
const GIF = "/gif";
const authenticateToken = require("./authentication/authenticateToken");
const authenticateTokenForUpload = require("./authentication/authenticateTokenForUpload");
const parseTimestamp = require("./functions/parseTimestamp");
const User = require("./database/schemas/userSchema");
const Auction = require("./database/schemas/auctionSchema");
const runAtSpecificTimeOfDay = require("./functions/runAtSpecificTimeOfDay");
const addLastDayToDates = require("./functions/addLastDayToDates");
const connectDatabase = require("./database/database");
const home = require("./routes/home");
const login = require("./routes/login");
const logout = require("./routes/logout");
const admin = require("./routes/admin");
const edit = require("./routes/edit");
const usersData = require("./routes/usersData");
const dates = require("./routes/dates");
const auctions = require("./routes/auctions");
const image = require("./routes/image");
const latestAuction = require("./routes/latestAuction");
const favicon = require("./routes/favicon");
const editAuction = require("./routes/editAuction");
const analitics = require("./routes/analitics");
const uploadImages = require("./routes/uploadImages");
const mostPopularPages = require("./routes/mostPopularPages");
require("dotenv").config();
app.use(cors());
app.options("*", cors());
app.set("view engine", "ejs");
app.use(express.json());
app.use("/public", express.static("public"));
app.use(requestIp.mw());
app.use(function (req, res, next) {
  const ip = req.clientIp;
  next();
});
app.locals.parseTimestamp = parseTimestamp;
process.on("uncaughtException", (error, origin) => {
  console.log("----- Uncaught exception -----");
  console.log(error);
  console.log("----- Exception origin -----");
  console.log(origin);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("----- Unhandled Rejection at -----");
  console.log(promise);
  console.log("----- Reason -----");
  console.log(reason);
});

// Database
connectDatabase();
// Run only on first startup to update databse records
// initialCreateUsers();

// Use this initially to insert all dates data. After first server startup!!!
//##################################################
// User.find(async (err, data) => {
//   const dates = createGraphData(data);
//   insertMultipleData(dates);
//   console.log(dates);
// });
//##################################################

runAtSpecificTimeOfDay(0, 10, () => {
  User.find(async (err, data) => {
    if (err) return console.error(err);
    addLastDayToDates(data);
  });
});

//Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") {
      cb(null, IMAGES);
    } else if (file.fieldname === "gif") {
      cb(null, GIF);
    }
  },
  filename: (req, file, cb) => {
    if (file.fieldname === "image") {
      const fileName = req.body.title;
      cb(null, fileName);
    } else if (file.fieldname === "gif") {
      cb(null, "giffy" + Date.now());
    }
  },
});

const cpUpload = upload.fields([
  { name: "image", maxCount: 10 },
  { name: "gif", maxCount: 1 },
]);

// API Routes
app.get("/", home);
app.post("/login", login);
app.get("/logout", logout);
app.get("/admin", authenticateToken, admin);
app.get("/edit", authenticateToken, edit);
app.get("/users-data", authenticateToken, usersData);
app.get("/dates", authenticateToken, dates);
app.get("/api/auctions", auctions);
app.get("/api/latest", latestAuction);
app.get("/images/:key", image);
app.get("/favicon.ico", favicon);
app.get("/edit-auction", authenticateToken, editAuction);
app.post("/api/edit-price", authenticateToken, (req, res) => {
  const updates = req.body.map((item) => {
    return { _id: item.id, price: item.newPrice };
  });

  const updateOperations = updates.map((update) => ({
    updateOne: {
      filter: { _id: update._id },
      update: { $set: { price: update.price } },
    },
  }));

  Auction.bulkWrite(updateOperations)
    .then((result) => {
      res.send(`Liczba zaktualizowanych cen: ${result.modifiedCount}.`);
    })
    .catch((error) => {
      res.sendStatus(500);
    });
});
app.post("/analitics", analitics);
app.post("/upload", authenticateTokenForUpload, cpUpload, uploadImages);
app.get("/most-popular-pages", authenticateToken, mostPopularPages);

app.get("*", async (req, res) => {
  res.status(404).json({ error: "Podana strona nie istnieje." });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
