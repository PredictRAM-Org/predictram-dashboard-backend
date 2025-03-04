const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subSchema = Schema({ symbol: String, value: Number ,companyname:String, isin:String }, { _id: false });
const priceSchema = new Schema(
  {
    data: Number,
    value: [subSchema],
    dict: Object,
  },
  { collection: "price", versionKey: false }
);
module.exports = mongoose.model("price", priceSchema);
