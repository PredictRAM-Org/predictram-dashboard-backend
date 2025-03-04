const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const portfolioManagmentReportSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "Users" },
    title: {
      type: String,
      required: true,
      minlength: [5, "Title should be more than 5 characters"],
    },
    subtitle: {
      type: String,
      required: true,
      minlength: [5, "Subtitle should be more than 5 characters"],
    },
    text: {
      type: String,
      required: true,
      minlength: [5, "Title should be more than 5 characters"],
    },
    data: {
      type: String,
      required: true,
      minlength: [5, "Data should be more than 5 characters"],
    },
    event: { type: ObjectId, ref: "PortfolioManagementEvent", required: true },
  },
  {
    collection: "portfolioManagementReport",
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PortfolioManagementReport",
  portfolioManagmentReportSchema
);
