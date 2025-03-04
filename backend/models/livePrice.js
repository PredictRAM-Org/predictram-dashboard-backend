const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const livePriceSchema = new Schema(
  {
    symbol: String,
    Code: String,
    Five_Period_Avg_Volume: String,
    Industry: String,
    Latest_Volume: String,
    Sector: String,
    Previous_Price: String,
    Price: String,
    Price_Change: String,
  },
  { collection: "pricedatascrapers", versionKey: false, timestamps: true }
);
module.exports = {
  livePrice: mongoose.model("pricedatascrapers", livePriceSchema),
  livePriceSchema,
};
