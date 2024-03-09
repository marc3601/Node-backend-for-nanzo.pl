const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

//auction schema
const auctionSchema = new mongoose.Schema({
  image: [
    {
      width: Number,
      height: Number,
      url: String,
      thumbnail: { type: Boolean, default: false },
      id: String,
    },
  ],
  imageLarge: [
    {
      width: Number,
      height: Number,
      url: String,
      id: String,
    },
  ],
  gif: {
    width: Number,
    height: Number,
    url: String,
  },
  description: String,
  title: String,
  price: Number,
  id: String,
});
auctionSchema.plugin(mongoosePaginate);

const Auction = mongoose.model("Auction", auctionSchema);

module.exports = Auction;
