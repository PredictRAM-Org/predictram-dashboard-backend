const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const portfolioSchema = new Schema(
  {
    symbol: { type: String },
    ownerid: { type: mongoose.Schema.ObjectId, ref: "Users" },
    companyName: { type: String },
    var: { type: Number, default: 0 },
    totalquantity: { type: Number, default: 0 },
    totalinvested: { type: Number, default: 0 },
    perstockprice: { type: Number, default: 0 },
    riskId: { type: mongoose.Schema.ObjectId, ref: "Riskscore" },
    portfolioName: { type: String },
  },
  { collection: "portfolio", versionKey: false, timestamps: true }
);
module.exports = mongoose.model("portfolio", portfolioSchema);
