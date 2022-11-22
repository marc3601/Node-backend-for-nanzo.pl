const fetch = require("node-fetch");
const User = require("../database/schemas/userSchema");
const saveUserInfo = async (ip, userData, device) => {
  const link = `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.GEO_API_KEY}&ip=${ip}`;
  const ipInfoLink = `https://ipinfo.io/${ip}?token=${process.env.IPINFO_API_KEY}`;
  const timestamp = Date.now();
  const mainData = await fetch(link);
  const body = await mainData.json();
  const cityInfo = await fetch(ipInfoLink);
  const city = await cityInfo.json();

  const newUser = new User({
    userIp: ip ? ip : null,
    countryName: body.country_name ? body.country_name : null,
    countryFlag: body.country_flag ? body.country_flag : null,
    isp: body.isp ? body.isp : null,
    city: city.city ? city.city : body?.city,
    timestamp: timestamp ? timestamp : null,
    visitSource: userData?.ref ? userData.ref : null,
    entryPage: userData?.loc ? userData.loc : null,
    device: device ? device : null,
  });

  newUser.save((err, user) => {
    if (err) return console.error(err);
  });
};

module.exports = saveUserInfo;
