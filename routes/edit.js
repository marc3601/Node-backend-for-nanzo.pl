const edit = async (req, res) => {
  res.sendFile(__dirname + "/edit.html");
};

module.exports = edit;
