const Mongoose = require("mongoose");

const ModelCreditTransactionSchema = new Mongoose.Schema(
  {
    user: { type: Mongoose.Schema.ObjectId, ref: "Investors" },
    modelName: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "ModelCreditTransaction",
  }
);

module.exports = Mongoose.model(
  "ModelCreditTransaction",
  ModelCreditTransactionSchema
);
