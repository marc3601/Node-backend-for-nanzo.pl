const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
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
};

module.exports = login;
