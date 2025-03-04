const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const portfolioLeaderBoard = new Schema(
  {
    advisor: { type: ObjectId, ref: "Users", require: true },
    portfolioEvent: {
      type: ObjectId,
      ref: "PortfolioManagementEvent",
      require: true,
    },
    acceptedBy: { type: ObjectId, ref: "Users" },
    rejectedBy: { type: ObjectId, ref: "Users" },
  },
  { timestamps: true, collection: "portfolioLeaderBoard" }
);

module.exports = new model("portfolioLeaderBoard", portfolioLeaderBoard);
