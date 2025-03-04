const mongoose = require("mongoose");
const Riskscore = require("../models/riskscore");
const RiskscoreQuestions = require("../models/riskscoreQuestions");
const QueryFilter = require("../utils/QueryFilter");
const { ObjectId } = mongoose.Types;

module.exports = {
  createriskscore: async (req, res) => {
    try {
      const { riskTolerance, riskCapacity, riskProfile, userId, questions } =
        req.body;
      const data = await Riskscore.findOneAndUpdate(
        {
          userId: ObjectId(userId),
        },
        {
          userId: userId,
          riskScores: { riskTolerance, riskCapacity, riskProfile },
          questions,
        },
        { upsert: true }
      );
      res.apiResponse(true, "Risk Score created successfully", data);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getriskscore: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["id"]);
      const filteredParams = queryFilter.filter(req.query);
      const uid = filteredParams?.id || req?.user?.id;
      const data = await Riskscore.find({ userId: ObjectId(uid) });
      res.send({ data });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getriskscoreQustions: async (req, res) => {
    try {
      const data = await RiskscoreQuestions.find({});
      res.send({ data });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
