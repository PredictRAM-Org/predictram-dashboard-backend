const { Schema, model } = require("mongoose");

const mutualFundSchema = new Schema(
  {
    name: { type: String, required: true },
    Benchmark: { type: String, required: true },
    Riskometer_Scheme: { type: String, required: true },
    Riskometer_Benchmark: { type: String, required: true },
    NAV_Date: { type: Number },
    NAV_Regular: { type: Number },
    NAV_Direct: { type: Number },
    Return_1_Year_Regular: { type: Number },
    Return_1_Year_Direct: { type: Number },
    Return_1_Year_Benchmark: { type: Number },
    Return_3_Year_Regular: { type: Number },
    Return_3_Year_Direct: { type: Number },
    Return_3_Year_Benchmark: { type: Number },
    Return_5_Year_Regular: { type: Number },
    Return_5_Year_Direct: { type: Number },
    Return_5_Year_Benchmark: { type: Number },
    Return_10_Year_Regular: { type: Number },
    Return_10_Year_Direct: { type: Number },
    Return_10_Year_Benchmark: { type: Number },
    Return_Since_Launch_Regular: { type: Number },
    Return_Since_Launch_Direct: { type: Number },
    Return_Since_Launch_Benchmark: { type: Number },
    Daily_AUM: { type: Number },
  },
  { collection: "mutualFund", versionKey: false }
);

module.exports = model("mutualFund", mutualFundSchema);
