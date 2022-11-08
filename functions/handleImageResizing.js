const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { uploadFile } = require("../s3");
const util = require("util");
const fs = require("fs");
const unlinkFile = util.promisify(fs.unlink);
const Auction = require("../database/schemas/auctionSchema");
let image = [];
const handleImageResizing = async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const thumbnail = req.body.thumbnail;
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
      console.error(err);
      res.status(500).send("Bład przesyłania");
    });
};

module.exports = handleImageResizing;
