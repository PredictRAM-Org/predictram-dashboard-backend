const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fundamentalDataSchema = new Schema(
  {
    symbol: String,
    BalanceSheet: [],
    CashFlow: [],
    EfficiencyRatios: [],
    IncomeStatement: [],
    RiskPriceAndValuation: [],
    label: String,
  },
  { collection: "fundamentaldatascrapers", versionKey: false, timestamps: true }
);
module.exports = {
  livePrice: mongoose.model("fundamentaldatascrapers", fundamentalDataSchema),
  fundamentalDataSchema,
};
