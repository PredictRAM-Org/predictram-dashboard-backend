const { Schema, model } = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const advisorySessionsSchema = new Schema(
  {
    investorId: { type: ObjectId, ref: "Investors", required: true },
    booking_id: { type: String, required: true },
    booked_on: { type: String, required: true },
    summary_url: { type: String, required: true },
  },
  { collection: "advisorySessions", versionKey: false }
);

module.exports = new model("advisorySessions", advisorySessionsSchema);
