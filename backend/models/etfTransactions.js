const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const etfTransactionSchema = new Schema(
  {
    userId: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    purchasedStocks: { type: [String], default: [] },
  },
  { collection: "etfTransaction", versionKey: false, timestamps: true },
);
module.exports = mongoose.model("etfTransaction", etfTransactionSchema);
