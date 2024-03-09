const home = async (req, res) => {
  if (req.headers.cookie !== undefined) {
    res.redirect("/admin");
  } else {
    res.sendFile(__dirname + "/login.html");
  }
};

module.exports = home;
