const { Schema, model } = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const adviceSessionsSchema = new Schema(
  {
    bookedBy: { type: ObjectId, ref: "Investors", required: true },
    bookedFor: { type: ObjectId, ref: "Users", required: true },
    sessionLink: {
      type: "String"
    },
    schedule: {
      date: {
        type: "Date", required: true
      },
      time: {
        type: "String", required: true
      }
    }
  },
  { collection: "adviceSessions", versionKey: false }
);

module.exports = model("AdviceSessions", adviceSessionsSchema);