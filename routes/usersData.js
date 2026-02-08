const User = require("../database/schemas/userSchema");
const urlViewSchema = require("../database/schemas/urlViewSchema"); // Add this import

const usersData = async (req, res) => {
  res.set("Cache-Control", "no-store");
  
  // Fetch homepage views once
  let homepageViews = 0;
  try {
    const homepageUrl = await urlViewSchema.findOne({ url: 'https://noanzo.pl/' });
    homepageViews = homepageUrl ? homepageUrl.views : 0;
  } catch (error) {
    console.error('Error fetching homepage views:', error);
    // homepageViews remains 0
  }
  
  // Helper function to render with homepage views
  const renderWithHomepageViews = (err, data) => {
    if (err) return console.error(err);
    
    // Add homepage views to data
    data.homepageViews = homepageViews;
    if (req.query.page && data.total - data.offset <= 0) {
      res.render("users", { data: { ...data, offset: 0, homepageViews: homepageViews } });
    } else {
      res.render("users", { data: data });
    }
  };
  
  if (req.query.page) {
    let page = parseInt(req.query.page);
    if (page % 1 !== 0) {
      page = Math.round(page);
    }
    const offset = page * 15;
    
    User.paginate(
      {},
      { offset: offset ? offset : 0, limit: 15, sort: { _id: -1 } },
      renderWithHomepageViews
    );
  } else {
    User.paginate(
      {},
      { offset: 0, limit: 15, sort: { _id: -1 } },
      renderWithHomepageViews
    );
  }
};

module.exports = usersData;