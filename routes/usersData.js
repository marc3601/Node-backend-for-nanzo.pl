const User = require("../database/schemas/userSchema");
const usersData = async (req, res) => {
  if (req.query.page) {
    let page;
    try {
      page = parseInt(req.query.page);
    } catch (error) {
      console.error(error);
    }
    User.paginate(
      {},
      { offset: page, limit: 50, sort: { _id: -1 } },
      (err, data) => {
        if (err) return console.error(err);
        res.render("users", { data: data });
      }
    );
  } else {
    User.paginate(
      {},
      { offset: 0, limit: 50, sort: { _id: -1 } },
      (err, data) => {
        if (err) return console.error(err);
        res.render("users", { data: data });
      }
    );
  }
};

module.exports = usersData;
