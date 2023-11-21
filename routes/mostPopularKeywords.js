const getMostPopularKeywordsLastMonth = require("../services/searchConsoleApi");
const mostPopularKeywords = async (req, res) => {
  res.set("Cache-Control", "public, max-age=600");
  try {
    const response = await getMostPopularKeywordsLastMonth();
    res.send(response);
    // res.send("OK");
  } catch (error) {
    res.sendStatus(500);
  }
};

module.exports = mostPopularKeywords;
