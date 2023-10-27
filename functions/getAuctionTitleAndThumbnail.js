const Auction = require("../database/schemas/auctionSchema");

const getData = async (auctionID) => {
  let body = {};
  if (auctionID === "main") {
    body = await Auction.findOne({}, {}, { sort: { _id: -1 } }, (err) => {
      if (err) return console.error(err);
    });
  } else {
    body = await Auction.findOne({ id: auctionID }, (err) => {
      if (err) return console.error(err);
    });
  }
  return body;
};

const createDataFromResponse = (body) => {
  const results = {
    title: "",
    thumbnail: "",
  };
  const arrayOfImages = body.image;
  const thumbnail = arrayOfImages.filter((item) => item.thumbnail);
  if (thumbnail.length > 0) {
    results.thumbnail = thumbnail[0].url;
  } else {
    results.thumbnail = arrayOfImages[0].url;
  }
  results.title = body.title;
  return results;
};

const getAuctionTitleAndThumbnail = async (link) => {
  const baseUrl = "https://noanzo.pl/";
  if (link === baseUrl) {
    const body = await getData(`main`);
    const results = createDataFromResponse(body);
    return results;
  }
  const auctionId = link.substring(baseUrl.length);
  const body = await getData(auctionId);
  const results = createDataFromResponse(body);
  return results;
};

module.exports = getAuctionTitleAndThumbnail;
