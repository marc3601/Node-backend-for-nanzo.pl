const path = require("path");
const favicon = async (req, res) => {
  res.sendFile(path.join(__dirname, "/favicon.ico"));
};

module.exports = favicon;
