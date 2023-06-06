const logout = async (req, res) => {
  res.set("Cache-Control", "no-store");
  res.clearCookie("auth").redirect(301, "/");
};

module.exports = logout;
