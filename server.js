const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "upload/" });
const app = express();
const port = 8080;
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requestIp = require("request-ip");
const DeviceDetector = require("node-device-detector");
const IMAGES = "/upload";
const GIF = "/gif";
const { getFileStream, deleteFiles } = require("./s3");
const authenticateToken = require("./authentication/authenticateToken");
const authenticateTokenForUpload = require("./authentication/authenticateTokenForUpload");
const saveUserInfo = require("./functions/saveUserInfo");
const parseTimestamp = require("./functions/parseTimestamp");
const handleImageUpload = require("./functions/handleImageUpload");
const initialCreateUsers = require("./functions/initialCreateUsers");
const Auction = require("./database/schemas/auctionSchema");
const User = require("./database/schemas/userSchema");
const Dates = require("./database/schemas/dateSchema");
const insertMultipleData = require("./database/utils/insertMultipleData");
const createGraphData = require("./functions/createGraphData");
const runAtSpecificTimeOfDay = require("./functions/runAtSpecificTimeOfDay");
const addLastDayToDates = require("./functions/addLastDayToDates");
const connectDatabase = require("./database/database");

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
    //for debugging
    const now = Date.now();
    console.log(`Periodic function run timestamp: ${now}`);
  });
});

// For debugging - keep for now
//##################################################
// Dates.findOneAndDelete({ x: "13/11/2022" }, function (err, docs) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Deleted User : ", docs);
//   }
// });

// Dates.deleteMany((err, auctions) => {
//   if (err) return console.error(err);
//   console.log(auctions);
// });
//##################################################

//Device detector
const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
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
// Auction.deleteMany((err, auctions) => {
//     if (err) return console.error(err);
//     console.log(auctions)
// })

const { STATUS_CODES } = require("http");

// API Routes

app.get("/", async (req, res) => {
  if (req.headers.cookie !== undefined) {
    res.redirect("/admin");
  } else {
    res.sendFile(__dirname + "/login.html");
  }
});
app.post("/login", async (req, res) => {
  const user = req.body.username;
  const pass = req.body.password;
  if (user === process.env.ADMIN_LOGIN) {
    try {
      if (await bcrypt.compare(pass, process.env.ADMIN_PASS)) {
        const authUser = {
          user: user,
          password: pass,
        };
        const accessToken = jwt.sign(authUser, process.env.ACCES_TOKEN_SECRET);
        res
          .cookie("auth", accessToken, { httpOnly: true, maxAge: 3600000 })
          .redirect(301, "/admin");
      } else {
        res.status(401).send("Błędne hasło");
      }
    } catch {
      res.status(404).send("Błąd serwera");
    }
  } else {
    res.status(404).send("Błędny email");
  }
});

app.get("/logout", async (reg, res) => {
  res.clearCookie("auth").redirect(301, "/");
});

app.get("/admin", authenticateToken, async (req, res) => {
  User.find((err, data) => {
    if (err) return console.error(err);
    let userCount = data.length;
    res.render("main", { count: userCount.toString() });
  });
});

app.get("/users-data", authenticateToken, async (req, res) => {
  if (req.query.page) {
    let page;
    try {
      page = parseInt(req.query.page);
    } catch (error) {
      console.error(error);
    }
    User.paginate(
      {},
      { offset: page, limit: 50, sort: { _id: -1 } },
      (err, data) => {
        if (err) return console.error(err);
        res.render("users", { data: data });
      }
    );
  } else {
    User.paginate(
      {},
      { offset: 0, limit: 50, sort: { _id: -1 } },
      (err, data) => {
        if (err) return console.error(err);
        res.render("users", { data: data });
      }
    );
  }
});
app.get("/dates", authenticateToken, async (req, res) => {
  Dates.find((err, dates) => {
    res.send(dates);
  });
});
app.get("/api/auctions", async (req, res) => {
  if (req.query.page && req.query.limit) {
    let page, limit;
    try {
      page = parseInt(req.query.page);
      limit = parseInt(req.query.limit);
    } catch (error) {
      console.error(error);
    }
    Auction.paginate(
      {},
      { offset: page, limit: limit, sort: { _id: -1 } },
      (err, auctions) => {
        if (err) return console.error(err);
        res.send(auctions.docs);
      }
    );
  } else {
    if (req.query.id) {
      const response = [];
      Auction.findOne({ id: req.query.id }, (err, auction) => {
        if (err) return console.error(err);
        response.push(auction);
        res.send(response);
      });
    } else {
      Auction.find()
        .sort({ _id: -1 })
        .exec((err, auctions) => {
          if (err) return console.error(err);
          res.send(auctions);
        });
    }
  }
});
app.get("/images/:key", async (req, res) => {
  const key = req.params.key;
  res.set("Cache-Control", "public, max-age=86400");
  try {
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (err) {
    res.sendStatus(404);
  }
});
app.get("/api/latest", async (req, res) => {
  Auction.findOne()
    .sort({ _id: -1 })
    .limit(1)
    .exec((err, auction) => {
      if (err) return console.error(err);
      res.send(auction);
    });
});
app.get("/favicon.ico", async (req, res) => {
  res.sendFile(path.join(__dirname, "/favicon.ico"));
});

app.get("/delete", authenticateToken, async (req, res) => {
  const id = req.query.id;
  Auction.deleteOne({ id: id }).exec((err, item) => {
    if (err) return console.err;
    res.status(200).send(item);
  });
  await deleteFiles(id)
    .then((stat) => console.log(stat))
    .catch((err) => console.log(err));
});

app.post("/analitics", async (req, res) => {
  let ip = req.clientIp;
  let userData = req.body;
  const userAgent = req.headers["user-agent"];
  const device = detector.detect(userAgent);
  User.findOne({ userIp: ip }, (err, user) => {
    if (err) return console.error(err);
    if (!user) {
      saveUserInfo(ip, userData, device);
    } else {
      return;
    }
  });
  res.sendStatus(200);
});

const cpUpload = upload.fields([
  { name: "image", maxCount: 10 },
  { name: "gif", maxCount: 1 },
]);
app.post(
  "/upload",
  authenticateTokenForUpload,
  cpUpload,
  async (req, res, next) => {
    if (req.files["image"].length <= 10) {
      handleImageUpload(req, res);
    } else {
      res.status(404).send("Wybierz max 10 plików");
    }
  }
);

app.get("*", async (req, res) => {
  res.status(404).json({ error: "Podana strona nie istnieje." });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
