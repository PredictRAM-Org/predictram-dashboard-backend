const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const eventPortfolioSchema = new Schema(
  {
    stocks: [
      {
        symbol: { type: String },
        comanyName: { type: String },
        var: { typpe: Number, default: 0 },
        totalquantity: { type: Number, default: 0 },
        totalinvested: { type: Number, default: 0 },
        perstockprice: { type: Number, default: 0 },
      },
    ],
    mutualFunds: [
      {
        type: ObjectId,
        ref: "mutualFund",
      },
    ],
    etfs: [
      {
        SYMBOL: { type: String },
        UNDERLYING_ASSET: { type: String },
        NAV: { type: String },
        VOLUME: { type: String },
        ThirtyDayPercentChange: { type: String },
      },
    ],
    bonds: [
      {
        Issuer_Name: { type: String },
        Redemption_Date: { type: String },
        Face_Value: { type: String },
        Coupon: { type: String },
        Secured_Unsecured: { type: String },
        Offer_Yield: { type: String },
      },
    ],
    ownerId: { type: ObjectId, ref: "Users" },
    eventId: { type: ObjectId, ref: "events" },
    portfolioName: { type: String },
  },
  { collection: "eventPortfolio", versionKey: false }
);

module.exports = model("eventPortfolio", eventPortfolioSchema);
