const fs = require("fs");
const gifResize = require("@gumlet/gif-resize");
const probe = require("probe-image-size");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { uploadGif } = require("../s3");
const handleGif = (req, res, gif, auction) => {
  if (req.files["gif"] !== undefined) {
    let gifPath = req.files["gif"][0].path;
    const buf = fs.readFileSync(gifPath);
    gifResize({
      width: 300,
      optimizationLevel: 1,
      resize_method: "sample",
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

module.exports = handleGif;
