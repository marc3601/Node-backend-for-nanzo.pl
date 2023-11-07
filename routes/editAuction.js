const Auction = require("../database/schemas/auctionSchema");
const { deleteFiles } = require("../s3");
const editAuction = async (req, res) => {
  const action = req.query.action;
  const id = req.query.id;
  // Auction.deleteOne({ id: id }).exec((err, item) => {
  //   if (err) return console.err;
  //   res.status(200).send(item);
  // });
  // await deleteFiles(id)
  //   .then((stat) => console.log(stat))
  //   .catch((err) => console.log(err));

  if (id) {
    res.setHeader("content-type", "text/plain");

    res.send(`ID: ${id}`);
    console.log(action + " " + id);
  } else {
    res.sendStatus(200);
  }
};

module.exports = editAuction;
