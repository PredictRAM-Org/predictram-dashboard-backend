const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const eventSummarySchema = new Schema(
  {
    event: { type: ObjectId, ref: "events" },
    totalStocks: { type: Number, default: 500 },
    totalPapers: { type: Number, default: 250 },
    totalAnalysis: { type: Number, default: 250 },
  },
  { collection: "eventSummary", versionKey: false, timestamps: true }
);

module.exports = model("eventSummary", eventSummarySchema);
