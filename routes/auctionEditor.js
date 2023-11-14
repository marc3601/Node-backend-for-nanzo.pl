const Auction = require("../database/schemas/auctionSchema");
const { deleteFiles } = require("../s3");
const admin = async (req, res) => {
  const id = req.query.id;
  res.set("Cache-Control", "no-store");
  Auction.findById(id, (err, auction) => {
    if (err) {
      console.error(err);
      res.sendStatus(404);
    } else {
      if (auction) {
        res.render("editor", { data: auction });
      } else {
        res.redirect("/edit");
      }
    }
  });
};

module.exports = admin;
