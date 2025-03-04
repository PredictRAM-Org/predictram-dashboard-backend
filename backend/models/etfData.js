const { Schema, model } = require("mongoose");

const etfDataSchema = new Schema(
  {
    symbol: { type: String },
    assets: { type: String },
    open: { type: String },
    high: { type: String },
    low: { type: String },
    ltP: { type: String },
    chn: { type: String },
    per: { type: String },
    qty: { type: String },
    trdVal: { type: String },
    nav: { type: String },
    wkhi: { type: String },
    wklo: { type: String },
    xDt: { type: String },
    cAct: { type: String },
    yPC: { type: String },
    mPC: { type: String },
    prevClose: { type: String },
    nearWKH: { type: String },
    nearWKL: { type: String },
    chartTodayPath: { type: String },
    perChange365d: { type: String },
    date365dAgo: { type: String },
    chart365dPath: { type: String },
    date30dAgo: { type: String },
    perChange30d: { type: String },
    chart30dPath: { type: String },
    meta: Object,
  },
  { collection: "etfDataScraper", versionKey: false, timestamps: true }
);

module.exports = {
  etfData: model("etfDataScraper", etfDataSchema),
  etfDataSchema,
};
