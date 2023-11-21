const searchConsole = require("@googleapis/searchconsole");
const sortArrayOfObjects = require("../functions/sortArrayOfObjects");
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

const queryMostPopularPagesinWeb = {
  siteUrl: "sc-domain:noanzo.pl",
  startDate: from,
  endDate: to,
  dimensions: ["query"],
  rowLimit: 10,
  orderBy: [{ fieldName: "clicks", sortOrder: "desc" }],
  type: ["web"],
};
const queryMostPopularPagesinImage = {
  siteUrl: "sc-domain:noanzo.pl",
  startDate: from,
  endDate: to,
  dimensions: ["query"],
  rowLimit: 10,
  orderBy: [{ fieldName: "clicks", sortOrder: "desc" }],
  type: ["image"],
};

const getMostPopularKeywordsLastMonth = async () => {
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
    const responseWeb = await client.searchanalytics.query(
      queryMostPopularPagesinWeb
    );
    const responseImage = await client.searchanalytics.query(
      queryMostPopularPagesinImage
    );
    const result = [];
    for (const row of responseWeb.data.rows) {
      const keyword = {
        keyword: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        domain: "web",
      };
      result.push(keyword);
    }
    for (const row of responseImage.data.rows) {
      const keyword = {
        keyword: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        domain: "image",
      };
      result.push(keyword);
    }
    const sorted = sortArrayOfObjects(result, "clicks", (order = "descending"));
    return sorted;
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = getMostPopularKeywordsLastMonth;
