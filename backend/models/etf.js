const mongoose = require("mongoose");
const moment = require("moment");

const today = new Date();
const futureDate = moment(today).add(15, "d").toDate();

const etfSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Types.ObjectId, required: true },
    title: { type: String, required: true },
    stocks: [String],
    createdPrice: { type: Number, default: 0 },
    currentPrice: { type: Number, default: 0 },
    endDate: { type: Date, default: futureDate },
  },
  { collection: "ETF", versionKey: false, timestamps: true }
);

module.exports = mongoose.model("etf", etfSchema);
