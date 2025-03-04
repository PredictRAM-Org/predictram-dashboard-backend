const mongoose = require("mongoose");
const likesSchema = mongoose.Schema(
  {
    id: { type: mongoose.Schema.ObjectId, ref: "research" },
    rate: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: String,
    userid: String,
    email: { type: String },
    secret_token: { type: String },
    phone: { type: String, required: true },
    image: String,
    password: String,
    admin: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    accessToRate: {
      type: Boolean,
      default: false,
    },
    accessToUser: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["APPROVED", "REJECTED"],
      description:
        "Used to identify the status of the intern (APPROVED or REJECTED)",
    },
    profilecomplete: { type: Boolean, default: false },
    professional: {
      type: Boolean,
      default: false,
    },
    isBetaUser: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["USER", "PRE_USER"],
    },
    payments: {
      orderId: String,
      premiumUser: { type: Boolean, default: false },
      triedFreePremium: { type: Boolean, default: false },
      expiry: { type: Date },
      paymentId: String,
      paymentDate: { type: Date },
    },
    likedresearchpaper: [likesSchema],
    referedby: { type: mongoose.Schema.ObjectId, ref: "Users" },
    isPublic: { type: Boolean, default: false },
  },
  { collection: "Users", versionKey: false, timestamps: true }
);
module.exports = mongoose.model("Users", userSchema);
