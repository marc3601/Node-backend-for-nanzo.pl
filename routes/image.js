const { getFileStream } = require("../s3");
const image = async (req, res) => {
  const key = req.params.key;
  res.set("Cache-Control", "public, max-age=31536000");
  try {
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (err) {
    res.sendStatus(404);
  }
};

module.exports = image;
