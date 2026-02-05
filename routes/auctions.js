const Auction = require("../database/schemas/auctionSchema");
const UrlView = require("../database/schemas/urlViewSchema"); // Import UrlView schema

const auctions = async (req, res) => {
  try {
    if (req.query.page && req.query.limit) {
      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);

      const result = await Auction.paginate(
        {},
        { offset: page, limit: limit, sort: { _id: -1 } }
      );

      // Get all auction IDs
      const auctionIds = result.docs.map(auction => auction.id);

      // Fetch view counts for matching URLs
      const urlViews = await UrlView.find({
        url: { $regex: new RegExp(auctionIds.join('|')) }
      });

      // Create a map of auction ID to view count
      const viewCountMap = {};
      urlViews.forEach(urlView => {
        // Extract auction ID from URL
        const match = urlView.url.match(/\/produkt\/([a-f0-9-]+)/i);
        if (match && match[1]) {
          viewCountMap[match[1]] = urlView.views;
        }
      });

      // Add viewcount to each auction
      const auctionsWithViews = result.docs.map(auction => {
        const auctionObj = auction.toObject();
        auctionObj.viewcount = viewCountMap[auction.id] || 0;
        return auctionObj;
      });

      res.send(auctionsWithViews);
    } else if (req.query.id) {
      const auction = await Auction.findOne({ id: req.query.id });
      
      if (!auction) {
        return res.send([]);
      }

      // Find matching URL view
      const urlView = await UrlView.findOne({
        url: { $regex: new RegExp(req.query.id, 'i') }
      });

      const auctionObj = auction.toObject();
      auctionObj.viewcount = urlView ? urlView.views : 0;

      res.send([auctionObj]);
    } else {
      const auctions = await Auction.find().sort({ _id: -1 });

      // Get all auction IDs
      const auctionIds = auctions.map(auction => auction.id);

      // Fetch view counts
      const urlViews = await UrlView.find({
        url: { $regex: new RegExp(auctionIds.join('|')) }
      });

      // Create a map of auction ID to view count
      const viewCountMap = {};
      urlViews.forEach(urlView => {
        const match = urlView.url.match(/\/produkt\/([a-f0-9-]+)/i);
        if (match && match[1]) {
          viewCountMap[match[1]] = urlView.views;
        }
      });

      // Add viewcount to each auction
      const auctionsWithViews = auctions.map(auction => {
        const auctionObj = auction.toObject();
        auctionObj.viewcount = viewCountMap[auction.id] || 0;
        return auctionObj;
      });

      res.send(auctionsWithViews);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = auctions;