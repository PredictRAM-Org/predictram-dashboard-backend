const mongoose = require("mongoose");

const stockSecurityIdSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, index: true },
    security_id: { type: String, required: true },
    name: { type: String, required: true },
    exchange: { type: String, required: true },
  },
  { timestamps: true, versionKey: false, collection: "stockSecurityId" }
);

module.exports = mongoose.model("stockSecurityId", stockSecurityIdSchema);
