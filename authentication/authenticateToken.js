const jwt = require("jsonwebtoken");
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

module.exports = authenticateToken;
