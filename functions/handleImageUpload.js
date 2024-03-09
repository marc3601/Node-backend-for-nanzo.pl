const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { uploadFile } = require("../s3");
const util = require("util");
const fs = require("fs");
const unlinkFile = util.promisify(fs.unlink);
const Auction = require("../database/schemas/auctionSchema");
const handleGif = require("./handleGif");

const handleImageUpload = async (req, res) => {
  const { title, description, price, thumbnail } = req.body;
  let image = [];
  let imageLarge = [];

  if (!req.files) return next();

  try {
    for (const [id, item] of req.files["image"].entries()) {
      // Small images
      const imageID = uuidv4();
      const data = await sharp(item.path, { failOnError: false })
        .resize(550)
        .jpeg({ mozjpeg: true })
        .toFile(`upload/result${id}.jpeg`);

      await uploadFile(`upload/result${id}.jpeg`, item, "");

      const url = `https://admin.noanzo.pl/images/${item.filename}`;
      const urlLarge = `https://admin.noanzo.pl/images/${item.filename}_large`;
      image.push({
        width: data.width,
        height: data.height,
        url: url,
        thumbnail: item.originalname === thumbnail,
        id: imageID,
      });

      // Large images
      const dataLarge = await sharp(item.path, { failOnError: false })
        .resize(1920)
        .jpeg({ mozjpeg: true })
        .toFile(`upload/result${id}_large.jpeg`);

      await uploadFile(`upload/result${id}_large.jpeg`, item, "_large");

      imageLarge.push({
        width: dataLarge.width,
        height: dataLarge.height,
        url: urlLarge,
        id: imageID,
      });

      await Promise.all([
        await unlinkFile(item.path),
        await unlinkFile(`upload/result${id}.jpeg`),
        unlinkFile(`upload/result${id}_large.jpeg`),
      ]);
    }

    let auction = new Auction({
      image: image,
      imageLarge: imageLarge,
      description: description,
      price: price,
      title: title,
      id: uuidv4(),
    });

    if (req.files["gif"]) {
      handleGif(req, res, null, auction);
    } else {
      auction.save((err, auction) => {
        if (err) {
          console.error(err);
          res.status(500).send("Błąd podczas zapisywania aukcji");
        } else {
          console.log("Saved: " + auction);
          image = [];
          res.send("Ogłoszenie zostało dodane.");
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Błąd przesyłania");
  }
};

module.exports = handleImageUpload;
