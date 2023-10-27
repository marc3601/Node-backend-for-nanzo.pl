const Auction = require("../database/schemas/auctionSchema");
const { deleteFiles } = require("../s3");
const deleteAuction = async (req, res) => {
  const id = req.query.id;
  Auction.deleteOne({ id: id }).exec((err, item) => {
    if (err) return console.err;
    res.status(200).send(item);
  });
  await deleteFiles(id)
    .then((stat) => console.log(stat))
    .catch((err) => console.log(err));
};

module.exports = deleteAuction;
