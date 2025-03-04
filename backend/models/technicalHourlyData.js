const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const technicalHourlyDataSchema = new Schema(
  {
    symbol: String,
    Overbought_Sold_Oscillators: [],
    Technical_Indicator: [],
    Technicals_with_Overlay_Bands: [],
    Volume_based_Technicals: [],
    label: String,
  },
  {
    collection: "technicalhourdatascrapers",
    versionKey: false,
    timestamps: true,
  }
);
module.exports = {
  livePrice: mongoose.model(
    "technicalhourdatascrapers",
    technicalHourlyDataSchema
  ),
  technicalHourlyDataSchema,
};
