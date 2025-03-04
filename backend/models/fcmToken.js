const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    sendNotification: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const FcmToken =
  mongoose.models.FcmToken || mongoose.model("FcmToken", fcmTokenSchema);

module.exports = FcmToken;
