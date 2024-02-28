const handleImageUpload = require("../functions/handleImageUpload");
const uploadImages = async (req, res, next) => {
  if (req.files["image"].length <= 10) {
    handleImageUpload(req, res);
  } else {
    res.status(404).send("Wybierz max 10 plików");
  }
};

module.exports = uploadImages;
