const getMostPopularPagesLastMonth = require("../services/searchConsoleApi");
const mostPopularPages = async (req, res) => {
  try {
    const response = await getMostPopularPagesLastMonth();
    res.send(response);
  } catch (error) {
    res.sendStatus(500);
  }
};

module.exports = mostPopularPages;
