const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const subscriberSubSchema = Schema(
  {
    userId: {
      type: ObjectId,
      ref: "Users",
    },
    total_revenue_income: {
      type: Number,
      required: true,
    },
    total_operating_expense: {
      type: Number,
      required: true,
    },
    EBITDA: {
      type: Number,
      required: true,
    },
    net_income: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const IncomeStatementSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stockSymbol: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    subscriber: { type: [subscriberSubSchema], default: [] },
  },
  { collection: "incomeStatement", versionKey: false }
);

module.exports = model("incomeStatement", IncomeStatementSchema);
