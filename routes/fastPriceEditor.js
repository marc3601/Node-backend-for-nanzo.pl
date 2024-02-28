const Auction = require("../database/schemas/auctionSchema");

const fastPriceEditor = (req, res) => {
  const updates = req.body.map((item) => {
    return { _id: item.id, price: item.newPrice };
  });

  const updateOperations = updates.map((update) => ({
    updateOne: {
      filter: { _id: update._id },
      update: { $set: { price: update.price } },
    },
  }));

  Auction.bulkWrite(updateOperations)
    .then((result) => {
      res.send(`Liczba zaktualizowanych cen: ${result.modifiedCount}.`);
    })
    .catch((error) => {
      res.sendStatus(500);
    });
};

module.exports = fastPriceEditor;
