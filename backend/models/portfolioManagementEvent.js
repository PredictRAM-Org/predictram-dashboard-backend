const mongoose = require("mongoose");

const portfolioStockSchema = mongoose.Schema(
  {
    companyName: { type: String, required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const portfolioSubmittedSchema = mongoose.Schema(
  {
    symbol: String,
    ownerid: { type: mongoose.Schema.ObjectId, ref: "Users" },
    companyName: String,
    var: { type: Number, default: 0 },
    totalquantity: { type: Number, default: 0 },
    totalinvested: { type: Number, default: 0 },
    perstockprice: { type: Number, default: 0 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, _id: false }
);

const portfolioManagementEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    portfolioRisk: { type: Number, required: true },
    comment: { type: String, required: false },
    idealRisk: { type: Number, required: true },
    portfolioStocks: [{ type: portfolioStockSchema }],
    totalPortfolioPrice: { type: Number, required: true },
    portfolioSubmitted: { type: [[portfolioSubmittedSchema]], default: [] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: "Investors" },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model(
  "PortfolioManagementEvent",
  portfolioManagementEventSchema
);
