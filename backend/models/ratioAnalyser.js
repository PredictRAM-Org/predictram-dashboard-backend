const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ratioAnalyserSchema = new Schema(
  {
    Date: [String],
    Total_Revenue: [Number],
    Cost_Of_Revenue: [Number],
    Total_Operating_Expense: [Number],
    Interest_Expense: [Number],
    Income_Tax_Expense: [Number],
    Total_Assets: [Number],
    Total_Liabilities: [Number],
    Accounts_Receivable: [Number],
    Inventory: [Number],
    Cash: [Number],
    Equivalents: [Number],
    StockName: String,
    output: Object,
  },
  {
    collection: "ratio_analyser",
    versionKey: false,
    timestamps: true,
  }
);
module.exports = {
  ratioAnalyser: mongoose.model("ratio_analyser", ratioAnalyserSchema),
  ratioAnalyserSchema,
};
