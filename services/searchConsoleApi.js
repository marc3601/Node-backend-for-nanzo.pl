const searchConsole = require("@googleapis/searchconsole");

const getTheMostPopularPages = {
  siteUrl: "sc-domain:noanzo.pl",
  startDate: "2023-01-01",
  endDate: "2023-05-22",
  dimensions: ["page"],
  rowLimit: 10, // Number of popular pages to retrieve
  orderBy: [{ fieldName: "clicks", sortOrder: "desc" }],
  searchType: ["web"],
};

const getMostPopularKeywords = async () => {
  const auth = new searchConsole.auth.GoogleAuth({
    credentials: {
      private_key: process.env.PRIVATE_KEY.replaceAll("\\n", "\n"),
      client_email: process.env.CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const client = searchConsole.searchconsole({
    version: "v1",
    auth,
  });

  client.searchanalytics
    .query(getTheMostPopularPages)
    .then((response) =>
      response.data.rows.forEach((row) =>
        console.log(
          `${row.keys[0]} --> ${row.impressions} impressions and ${row.clicks} clicks`
        )
      )
    )
    .catch((err) => console.error(err.message));
};

module.exports = getMostPopularKeywords;
