const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const portfolioScoreSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "Users", required: true },
    portfolioScore: { type: Number, required: true },
    eventId: { type: ObjectId, ref: "events" },
  },
  { collection: "portfolioScore", versionKey: false, timestamps: true }
);

module.exports = mongoose.model("PortfolioScore", portfolioScoreSchema);
