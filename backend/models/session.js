const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ENUMS = {
  // time in secs
  duration: [1800, 2700, 3600],
  tags: [
    "Technology",
    "Finance",
    "Economy",
    "General",
    "Analysis",
    "Carrer_Advice",
    "Others",
  ],
};
const scheduleSchema = new Schema(
  {
    date: { type: Date, required: true },
    fromTime: { type: String, required: true },
    toTime: { type: String, required: true },
  },
  { _id: false },
);
const sessionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    duration: { type: Number, enum: ENUMS.duration, required: true },
    tags: { type: String, enum: ENUMS.tags, required: true },
    fee: { type: Number, default: 0, required: true },
    instructor: { type: mongoose.Types.ObjectId, ref: "Users", required: true },
    assignedOn: { type: Date },
    scheduledTimeStamp: { type: scheduleSchema, required: false },
    rating: { type: Number },
    totalUserRegistered: { type: Number },
  },
  { collection: "session", versionKey: false, timestamps: true },
);
module.exports = mongoose.model("session", sessionSchema);
