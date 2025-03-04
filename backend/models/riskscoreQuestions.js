const { Schema, model } = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const optionsSubSchema = Schema(
  {
    text: { type: String, required: true },
    value: { type: Number, required: true }
  },
  //{ _id: false }
);

const riskscoreQestionsSchema = new Schema(
  {
    _id: { type: ObjectId, ref: "RiskQuestions", required: true },
    instruction: { type: String },
    imgurl: { type: String },
    question: { type: String },
    options: [optionsSubSchema],
    type: { type: String }
  },
  { collection: "RiskQuestions", versionKey: false }
);

module.exports = model("RiskscoreQuestions", riskscoreQestionsSchema);