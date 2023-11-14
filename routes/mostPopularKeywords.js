const getMostPopularKeywordsLastMonth = require("../services/searchConsoleApi");
const mostPopularKeywords = async (req, res) => {
  try {
    const response = await getMostPopularKeywordsLastMonth();
    res.send(response);
    // res.send("OK");
  } catch (error) {
    res.sendStatus(500);
  }
};

module.exports = mostPopularKeywords;
