const searchConsole = require("@googleapis/searchconsole");
const getAuctionTitleAndThumbnail = require("../functions/getAuctionTitleAndThumbnail");
const timeRangeMonth = () => {
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  return {
    from: `${oneMonthAgo.getFullYear()}-${(oneMonthAgo.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${oneMonthAgo.getDate().toString().padStart(2, "0")}`,
    to: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`,
  };
};

const { from, to } = timeRangeMonth();

const queryMostPopularPages = {
  siteUrl: "sc-domain:noanzo.pl",
  startDate: from,
  endDate: to,
  dimensions: ["page"],
  rowLimit: 20, // Number of popular pages to retrieve
  orderBy: [{ fieldName: "clicks", sortOrder: "desc" }],
  type: ["web"],
};

const getMostPopularPagesLastMonth = async () => {
  const data = [];
  const auth = new searchConsole.auth.GoogleAuth({
    credentials: {
      private_key: process.env.PRIVATE_KEY,
      client_email: process.env.CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const client = searchConsole.searchconsole({
    version: "v1",
    auth,
  });

  try {
    const response = await client.searchanalytics.query(queryMostPopularPages);
    for (const row of response.data.rows) {
      if (row.clicks > 0) {
        const results = await getAuctionTitleAndThumbnail(row.keys[0]).catch(
          (err) => console.error(err.message)
        );
        results.clicks = row.clicks;
        data.push(results);
      }
    }
    return data;
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = getMostPopularPagesLastMonth;
