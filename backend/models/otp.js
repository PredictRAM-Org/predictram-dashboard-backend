const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, index: true },
    email: { type: String, index: true },
    otp: String,
  },
  { collection: "otp", timestamps: true, versionKey: false }
);
module.exports = mongoose.model("otp", otpSchema);
