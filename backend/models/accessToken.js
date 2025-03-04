const { Schema, model } = require("mongoose");

const accessTokenSchema = new Schema(
  {
    access_token: { type: String, required: false },
    refresh_token: { type: String, required: false },
    key: {
      type: String,
      enum: ["fyersToken", "zohoToken"],
      default: "fyersToken",
    },
  },
  { timestamps: true, collection: "accessToken", versionKey: false }
);

module.exports = model("accessToken", accessTokenSchema);
