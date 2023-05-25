const Auction = require("../database/schemas/auctionSchema");
const latestAuction = async (req, res) => {
  Auction.findOne()
    .sort({ _id: -1 })
    .limit(1)
    .exec((err, auction) => {
      if (err) return console.error(err);
      res.send(auction);
    });
};

module.exports = latestAuction;
