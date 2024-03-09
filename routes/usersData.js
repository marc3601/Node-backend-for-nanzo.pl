const User = require("../database/schemas/userSchema");
const usersData = async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (req.query.page) {
    let page;
    page = parseInt(req.query.page);
    if (page % 1 !== 0) {
      page = Math.round(page);
    }
    const offset = page * 15;
    User.paginate(
      {},
      { offset: offset ? offset : 0, limit: 15, sort: { _id: -1 } },
      (err, data) => {
        if (err) return console.error(err);
        if (data.total - data.offset > 0) {
          res.render("users", { data: data });
        } else {
          res.render("users", { data: { ...data, offset: 0 } });
        }
      }
    );
  } else {
    User.paginate(
      {},
      { offset: 0, limit: 15, sort: { _id: -1 } },
      (err, data) => {
        if (err) return console.error(err);
        res.render("users", { data: data });
      }
    );
  }
};

module.exports = usersData;
