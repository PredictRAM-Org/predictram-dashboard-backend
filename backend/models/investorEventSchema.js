const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const investorEventSchema = new Schema(
  {
    eventId: {
      type: mongoose.Types.ObjectId,
      ref: "events",
      required: true,
      unique: true,
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("investorEvent", investorEventSchema);
