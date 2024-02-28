const User = require("../database/schemas/userSchema");

const initialCreateUsers = async () => {
  User.find((err, data) => {
    if (err) return console.error(err);
    data.forEach(async (item, i) => {
      if (i < 1) {
        const link = `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.GEO_API_KEY}&ip=${item.userIp}`;
        const response = await fetch(link);
        const body = await response.json();
        const filter = { userIp: body.ip };
        const update = {
          countryName: body.country_name ? body.country_name : null,
          countryFlag: body.country_flag ? body.country_flag : null,
          isp: body.isp ? body.isp : null,
          city: body.city ? body.city : null,
        };
        await User.findOneAndUpdate(filter, update, {
          new: true,
          useFindAndModify: false,
        });
      }
    });
  }).sort({ _id: -1 });
};

module.exports = initialCreateUsers;
