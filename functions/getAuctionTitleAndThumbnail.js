const getData = async (url) => {
  const response = await fetch(url);
  const body = await response.json();
  return body;
};

const createDataFromResponse = (body) => {
  const results = {
    title: "",
    thumbnail: "",
  };
  const arrayOfImages = body[0]?.image || body.image;
  const thumbnail = arrayOfImages.filter((item) => item.thumbnail);
  if (thumbnail.length > 0) {
    results.thumbnail = thumbnail[0].url;
  } else {
    results.thumbnail = arrayOfImages[0].url;
  }
  results.title = body[0]?.title || body.title;
  return results;
};

const getAuctionTitleAndThumbnail = async (link) => {
  const baseUrl = "https://noanzo.pl/";

  if (link === baseUrl) {
    const body = await getData(`http://localhost:8080/api/latest`);
    const results = createDataFromResponse(body);
    return results;
  }
  const auctionId = link.substring(baseUrl.length);
  const body = await getData(
    `http://localhost:8080/api/auctions?id=${auctionId}`
  );
  const results = createDataFromResponse(body);
  return results;
};

module.exports = getAuctionTitleAndThumbnail;
