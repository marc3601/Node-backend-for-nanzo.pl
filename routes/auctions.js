const Auction = require("../database/schemas/auctionSchema");
const auctions = async (req, res) => {
  if (req.query.page && req.query.limit) {
    let page, limit;
    try {
      page = parseInt(req.query.page);
      limit = parseInt(req.query.limit);
    } catch (error) {
      console.error(error);
    }
    Auction.paginate(
      {},
      { offset: page, limit: limit, sort: { _id: -1 } },
      (err, auctions) => {
        if (err) return console.error(err);
        res.send(auctions.docs);
      }
    );
  } else {
    if (req.query.id) {
      const response = [];
      Auction.findOne({ id: req.query.id }, (err, auction) => {
        if (err) return console.error(err);
        response.push(auction);
        res.send(response);
      });
    } else {
      Auction.find()
        .sort({ _id: -1 })
        .exec((err, auctions) => {
          if (err) return console.error(err);
          res.send(auctions);
        });
    }
  }
};

module.exports = auctions;
