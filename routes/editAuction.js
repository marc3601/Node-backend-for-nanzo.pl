const Auction = require("../database/schemas/auctionSchema");
const deleteURLsAndKeepIDs = require("../functions/deleteURLsAndKeepIDs");
const deleteManyImages = require("../functions/deleteManyImages");
const { deleteFiles } = require("../s3");
const editAuction = async (req, res) => {
  const action = req.query.action;
  const id = req.query.id;
  if (action === "delete" && id) {
    const ids = [];
    console.log(`Delete item id: ${req.query.id}`);
    Auction.findOneAndDelete({ _id: id }, (err, doc) => {
      if (err) console.error(err.message);
      // get image ids from urls
      doc.image.forEach((item) => {
        ids.push(deleteURLsAndKeepIDs(item.url));
      });
      // delete images in s3 bucket
      deleteManyImages(deleteFiles, ids)
        .then(() => {
          res.send("Ogłoszenie zostało usunięte.");
        })
        .catch((error) => {
          console.error("Error deleting files:", error);
          res.sendStatus(500);
        });
    });
  } else {
    res.send("no delete");
  }
};

module.exports = editAuction;
