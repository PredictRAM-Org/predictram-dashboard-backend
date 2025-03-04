const Mongoose = require("mongoose");

const profileStepsSchema = Mongoose.Schema(
  {
    yourRisk: { type: Boolean, default: false },
    portfolioRisk: { type: Boolean, default: false },
    purchasedEtf: { type: Boolean, default: false },
  },
  { _id: false }
);

const investorSchema = new Mongoose.Schema(
  {
    mobileNumber: { type: "String" },
    email: { type: "String" },
    secretToken: { type: "String" },
    firstName: { type: "String" },
    lastName: { type: "String" },
    uniqueId: { type: String, required: true },
    image: { type: String, required: false },
    profileCompletionSteps: { type: profileStepsSchema },
    profileCompleted: { type: "Boolean", default: false },
    estimatedInvestment: { type: Number, required: true, default: 0 },
    referedby: { type: Mongoose.Schema.ObjectId, ref: "Investors" },
    payments: {
      orderId: String,
      premiumUser: { type: Boolean, default: false },
      triedFreePremium: { type: Boolean, default: false },
      expiry: { type: Date },
      paymentId: String,
      paymentDate: { type: Date },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = Mongoose.model("Investors", investorSchema);
