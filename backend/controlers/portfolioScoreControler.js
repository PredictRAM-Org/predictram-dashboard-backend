const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const PortfolioScore = require("../models/portfolioScore");

module.exports = {
  createPortfolioScore: async (req, res) => {
    try {
      const schemaValidator = {
        userId: Joi.objectId().required(),
        eventId: Joi.objectId().required(),
        portfolioScore: Joi.number().required(),
      };

      if (Array.isArray(req.body)) {
        req.body.map((el) => {
          const result = Joi.validate(el, schemaValidator);
          if (result.error) {
            throw new Error(result.error.details[0].message);
          }
        });
        await PortfolioScore.insertMany(req.body);
      }
      res.send({
        success: true,
        message: "Portfolio Score created successfully",
      });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getPortfolioScore: async (req, res) => {
    try {
      if (req.query.fromDate && req.query.toDate) {
        const pipeline = [
          {
            $match: {
              createdAt: {
                $gte: new Date(req.query.fromDate),
                $lte: new Date(req.query.toDate),
              },
            },
          },
          {
            $group: {
              _id: "$userId",
              totalScore: {
                $sum: "$portfolioScore",
              },
            },
          },
        ];

        const results = await PortfolioScore.aggregate(pipeline);

        res.send({ data: results });
      } else {
        const pipeline = [
          {
            $group: {
              _id: "$userId",
              totalScore: {
                $sum: "$portfolioScore",
              },
            },
          },
        ];

        const results = await PortfolioScore.aggregate(pipeline);
        res.send({ data: results });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
