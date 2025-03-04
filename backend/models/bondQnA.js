const { Schema, model } = require("mongoose");

const bondQnASchema = new Schema(
  {
    name: { type: String, required: true },
    investor_type: { type: String, required: true },
    email: { type: String, required: true },
    contact_number: { type: String, required: true },
    asset_class: { type: String, required: true },
    sectors_interest: { type: String, required: true },
    investment_amount: { type: String, required: true },
    investment_duration: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("bondQnA", bondQnASchema);
