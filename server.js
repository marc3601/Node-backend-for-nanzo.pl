const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const upload = multer({ dest: "upload/" });
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const app = express();
const { v4: uuidv4 } = require("uuid");
const port = 8080;
const path = require("path");
const sharp = require("sharp");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const probe = require("probe-image-size");
const gifResize = require("@gumlet/gif-resize");
const requestIp = require("request-ip");
require("dotenv").config();
const IMAGES = "/upload";
const GIF = "/gif";
const fetch = require("node-fetch");
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(requestIp.mw());
app.use(function (req, res, next) {
  const ip = req.clientIp;
  next();
});
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
mongoose.connect("mongodb://localhost:27017/images", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected");
});

//auction schema
const auctionSchema = new mongoose.Schema({
  image: [
    {
      width: Number,
      height: Number,
      url: String,
      thumbnail: { type: Boolean, default: false },
    },
  ],
  gif: {
    width: Number,
    height: Number,
    url: String,
  },
  description: String,
  title: String,
  price: Number,
  id: String,
});
auctionSchema.plugin(mongoosePaginate);
const Auction = mongoose.model("Auction", auctionSchema);
//user schema

const userSchema = new mongoose.Schema({
  userIp: String,
  countryName: { type: String, default: null },
  countryFlag: { type: String, default: null },
  isp: { type: String, default: null },
  city: { type: String, default: null },
  timestamp: { type: Number, default: null },
});
const User = mongoose.model("User", userSchema);

// Run only on first startup to update databse records
const initialCreateUsers = async () => {
  User.find((err, data) => {
    if (err) return console.error(err);
    data.forEach(async (item, i) => {
      if (i < 1) {
        const link = `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.GEO_API_KEY}&ip=${item.userIp}`;
        const response = await fetch(link);
        const body = await response.json();
        const filter = { userIp: body.ip };
        const update = {
          countryName: body.country_name ? body.country_name : null,
          countryFlag: body.country_flag ? body.country_flag : null,
          isp: body.isp ? body.isp : null,
          city: body.city ? body.city : null,
        };
        await User.findOneAndUpdate(filter, update, {
          new: true,
          useFindAndModify: false,
        });
        console.log(item);
      }
    });
  }).sort({ _id: -1 });
};

// initialCreateUsers();

const saveUserInfo = async (ip) => {
  const link = `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.GEO_API_KEY}&ip=${ip}`;
  const timestamp = Date.now();
  const response = await fetch(link);
  const body = await response.json();
  const newUser = new User({
    userIp: ip ? ip : null,
    countryName: body.country_name ? body.country_name : null,
    countryFlag: body.country_flag ? body.country_flag : null,
    isp: body.isp ? body.isp : null,
    city: body.city ? body.city : null,
    timestamp: timestamp ? timestamp : null,
  });

  newUser.save((err, user) => {
    if (err) return console.error(err);
  });
};

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
const { uploadFile, getFileStream, uploadGif, deleteFiles } = require("./s3");
const { STATUS_CODES } = require("http");

const authenticateToken = (req, res, next) => {
  let reqToken = null;
  if (req.headers.cookie) {
    reqToken = req.headers.cookie.split("=")[1];
  }

  if (reqToken == null) return res.redirect("/");
  jwt.verify(reqToken, process.env.ACCES_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

//temporary solution
const authenticateTokenForUpload = (req, res, next) => {
  let reqToken = null;
  if (req.headers.cookie) {
    reqToken = req.headers.cookie.split("=")[1];
  }
  if (reqToken == null) return res.send("Jesteś niezalogowany");
  jwt.verify(reqToken, process.env.ACCES_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

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
  res.sendFile(__dirname + "/admin.html");
});

app.get("/users-data", authenticateToken, async (req, res) => {
  res.sendFile(__dirname + "/users-data.html");
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
  User.findOne({ userIp: ip }, (err, user) => {
    if (err) return console.error(err);
    if (user) {
      User.find((err, data) => {
        if (err) return console.error(err);
      });
    } else {
      saveUserInfo(ip);
    }
  });
  res.sendStatus(200);
});

app.get("/users-count", authenticateToken, async (req, res) => {
  User.find((err, data) => {
    if (err) return console.error(err);
    let userCount = data.length;
    res.send(userCount.toString());
  });

  // User.deleteMany({}, (err, data) => {
  //     console.log(data);
  // })
});

app.get("/users-info", authenticateToken, async (req, res) => {
  User.find((err, data) => {
    if (err) return res.statusCode(500);
    res.send(data);
  }).sort({ _id: -1 });
});

const cpUpload = upload.fields([
  { name: "image", maxCount: 8 },
  { name: "gif", maxCount: 1 },
]);
app.post(
  "/upload",
  authenticateTokenForUpload,
  cpUpload,
  async (req, res, next) => {
    if (req.files["image"].length <= 8) {
      let gif = null;
      const title = req.body.title;
      const description = req.body.description;
      const price = req.body.price;
      const thumbnail = req.body.thumbnail;
      let image = [];
      let auction = null;
      const handleImageResizing = async (req) => {
        if (!req.files) return next();
        await Promise.all(
          req.files["image"].map(async (item, id) => {
            await sharp(item.path, { failOnError: false })
              .rotate()
              .resize(550)
              .jpeg({ mozjpeg: true })
              .toFile(`upload/result${id}.jpeg`)
              .then(async (data) => {
                await uploadFile(`upload/result${id}.jpeg`, item).catch((err) =>
                  console.log(err)
                );
                const url = `https://admin.noanzo.pl/images/${item.filename}`;
                image.push({
                  width: data.width,
                  height: data.height,
                  url: url,
                  thumbnail: item.originalname === thumbnail ? true : false,
                });
                await unlinkFile(item.path);
                await unlinkFile(`upload/result${id}.jpeg`);
              });
          })
        )
          .then(() => {
            auction = new Auction({
              image: image,
              description: description,
              price: price,
              title: title,
              id: uuidv4(),
            });

            if (req.files["gif"] === undefined) {
              auction.save((err, auction) => {
                if (err) return console.error(err);
                console.log("Saved: " + auction);
                image = [];
                res.send("Ogłoszenie zostało dodane.");
              });
            }
          })
          .catch((err) => {
            res.status(404).send("Bład przesyłania");
          });
      };
      handleImageResizing(req);

      const handleGif = () => {
        if (req.files["gif"] !== undefined) {
          let gifPath = req.files["gif"][0].path;
          const buf = fs.readFileSync(gifPath);
          gifResize({
            width: 550,
            optimizationLevel: 3,
            resize_method: "catrom",
          })(buf)
            .then((data) => {
              gif = {};
              const path = `gif/giffy${Date.now()}.gif`;
              fs.writeFile(path, data, async (err) => {
                if (err) return console.log(err);
                let name = "gif" + Date.now();
                await uploadGif(path, name)
                  .then(async () => {
                    await probe(fs.createReadStream(path))
                      .then((data) => {
                        const url = `https://admin.noanzo.pl/images/${name}`;
                        gif.width = data.width;
                        gif.height = data.height;
                        gif.url = url;
                        if (auction === null) {
                          auction = {};
                        }
                        auction.gif = gif;
                        auction.save((err, auction) => {
                          if (err) return console.error(err);
                          console.log("Saved: " + auction);
                          gif = null;
                        });
                        res.send("Ogłoszenie zostało dodane. (GIF)");
                      })
                      .finally(async () => {
                        await unlinkFile(gifPath);
                        await unlinkFile(path);
                      });
                  })
                  .catch((err) => console.log(err.message));
              });
            })
            .catch((err) => console.log(err.message));
        }
      };
      handleGif();
    } else {
      res.status(404).send("Wybierz max 8 plików");
    }
  }
);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
