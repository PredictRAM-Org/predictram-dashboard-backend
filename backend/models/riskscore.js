const { Schema, model } = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const subSchema = Schema(
  {
    riskTolerance: { type: String, required: true },
    riskCapacity: { type: String, required: true },
    riskProfile: { type: String, required: true },
  },
  { _id: false }
);

const questionsSubSchema = Schema(
  {
    questionID: { type: ObjectId, ref: "RiskQuestions", required: true },
    selectedOptionValue: { type: Number, required: true }
  },
  //{ _id: false }
);

const riskscoreSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "Users", required: true },
    questions: [questionsSubSchema],
    riskScores: subSchema
  },
  { collection: "Riskscore", versionKey: false }
);

module.exports = model("Riskscore", riskscoreSchema);
