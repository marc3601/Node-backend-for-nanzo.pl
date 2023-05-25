const logout = async (req, res) => {
  res.clearCookie("auth").redirect(301, "/");
};

module.exports = logout;
