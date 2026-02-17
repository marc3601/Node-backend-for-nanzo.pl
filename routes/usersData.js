const User = require("../database/schemas/userSchema");
const urlViewSchema = require("../database/schemas/urlViewSchema");
const getTitleFromLink = require("../functions/getTitleFromLink");

const usersData = async (req, res) => {
  res.set("Cache-Control", "no-store");

  let homepageViews = 0;
  try {
    const homepageUrl = await urlViewSchema.findOne({ url: "https://noanzo.pl/" });
    homepageViews = homepageUrl ? homepageUrl.views : 0;
  } catch (error) {
    console.error("Error fetching homepage views:", error);
  }

  const getViewsText = (count) => {
    if (count === 1) return "wyświetlenie";
    else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return "wyświetlenia";
    else return "wyświetleń";
  };

  const page = req.query.page ? parseInt(req.query.page) : 0;
  const offset = page * 15;

  User.paginate(
    {},
    { offset, limit: 15, sort: { _id: -1 } },
    async (err, data) => {
      if (err) return console.error(err);

      // Resolve titles for all entryPages in parallel
      const docsWithTitles = await Promise.all(
        data.docs.map(async (item) => {
          let entryPageTitle = null;
          if (item.entryPage) {
            try {
              entryPageTitle = await getTitleFromLink(item.entryPage);
            } catch {
              entryPageTitle = item.entryPage; // fallback to raw URL on error
            }
          }
          return { ...item.toObject(), entryPageTitle };
        })
      );

      data.docs = docsWithTitles;
      data.homepageViews = `${homepageViews} ${getViewsText(homepageViews)}`;

      if (req.query.page && data.total - data.offset <= 0) {
        res.render("users", { data: { ...data, offset: 0 } });
      } else {
        res.render("users", { data });
      }
    }
  );
};

module.exports = usersData;