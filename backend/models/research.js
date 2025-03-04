const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const likesSchema = mongoose.Schema(
  {
    id: { type: ObjectId, ref: "Users" },
    rate: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);
const researchSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "Users" },
    title: {
      type: String,
      required: true,
      minlength: [5, "Title should be more than 5 characters"],
    },
    subtitle: {
      type: String,
      required: true,
      minlength: [5, "Subtitle should be more than 5 characters"],
    },
    data: {
      type: String,
      required: true,
      minlength: [5, "Data should be more than 5 characters"],
    },
    text: {
      type: String,
      required: true,
      minlength: [5, "Title should be more than 5 characters"],
    },
    image: {
      type: String,
      required: true,
    },
    event: { type: ObjectId, ref: "events", required: true },
    isVerified: { type: Boolean, required: true, default: false },
    isFeatured: { type: Boolean, default: false },
    rate: { type: Number, default: 0 },
    likes: [likesSchema],
    tags: [String],
    isShared: { type: Boolean, required: true, default: false },
    report: { type: String },
  },
  { collection: "research", versionKey: false, timestamps: true }
);
module.exports = mongoose.model("research", researchSchema);
