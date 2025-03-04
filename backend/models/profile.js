const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const expSchema = Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  position: { type: String, required: true },
  startdate: { type: Date, required: true },
  enddate: { type: Date, default: "" },
  present: { type: Boolean, default: false },
});
const profileSchema = new Schema(
  {
    _id: { type: mongoose.Schema.ObjectId, ref: "Users" },
    about: { type: String, required: true },
    age: { type: String, required: true },
    contact: { type: String, required: false },
    gender: { type: String, required: true },
    image: { type: String, default: "" },
    experience: [expSchema],
    sebiregistration: { type: String },
    wallet: { type: String },
    followedTags: [String],
  },
  { collection: "profile", versionKey: false }
);
module.exports = mongoose.model("profile", profileSchema);
