const User = require("../database/schemas/userSchema");
const DeviceDetector = require("node-device-detector");
const saveUserInfo = require("../functions/saveUserInfo");

//Device detector
const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

const analitics = async (req, res) => {
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
  res.json({ response: "OK" });
};

module.exports = analitics;
