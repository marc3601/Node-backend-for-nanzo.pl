const edit = async (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(__dirname + "/edit.html");
};

module.exports = edit;
