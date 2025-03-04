const { default: axios } = require("axios");
const incomeStatement = require("../models/incomeStatement");
const price = require("../models/price");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

module.exports = {
  async createIncomeStatementEvent(req, res) {
    try {
      const payload = {
        name: req.body.name,
        stockSymbol: req.body.stockSymbol,
        details: req.body.details,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      };
      const newPrediction = await incomeStatement.create(payload);
      res.apiResponse(
        true,
        "successfully created income statement event ",
        newPrediction
      );
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  async subscribeToIncomeStatementEvent(req, res) {
    try {
      const payload = {
        userId: req.body.userId,
        total_revenue_income: req.body.total_revenue_income,
        total_operating_expense: req.body.total_operating_expense,
        EBITDA: req.body.EBITDA,
        net_income: req.body.net_income,
      };
      const isSubscriberExists = await incomeStatement.exists({
        _id: req.params.eventId,
        "subscriber.userId": payload.userId,
      });
      if (!isSubscriberExists) {
        const updatedPrediction = await incomeStatement.findByIdAndUpdate(
          req.params.eventId,
          { $push: { subscriber: payload } },
          { new: true }
        );
        res.apiResponse(
          true,
          "successfully added new  income statement prediction ",
          updatedPrediction
        );
      } else {
        const updatedPrediction = await incomeStatement.findOneAndUpdate(
          {
            _id: req.params.eventId,
            "subscriber.userId": payload.userId,
          },
          {
            $set: {
              "subscriber.$.total_revenue_income": payload.total_revenue_income,
              "subscriber.$.total_operating_expense":
                payload.total_operating_expense,
              "subscriber.$.net_income": payload.net_income,
              "subscriber.$.EBITDA": payload.EBITDA,
            },
          },
          { new: true }
        );
        res.apiResponse(
          true,
          "successfully updated  income statement prediction ",
          updatedPrediction
        );
      }
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  async getIncomeStatementEvent(req, res) {
    try {
      const { eventId, userId, startDate, endDate } = req.query;
      const query = {};
      const projection = {
        name: 1,
        stockSymbol: 1,
        details: 1,
        startDate: 1,
        endDate: 1,
        subscriber: 1,
      };
      //eventid,userid => get user submitted prediction
      if (eventId) {
        query._id = eventId;
      }
      if (userId) {
        query["subscriber.userId"] = userId;
        delete projection.subscriber;
        projection["subscriber.$"] = 1;
      }

      if (startDate) {
        query.startDate = { $gte: new Date(startDate) };
      }
      if (endDate) {
        query.endDate = { $lte: new Date(endDate) };
      }

      const data = await incomeStatement
        .find(query, projection)
        .sort({ endDate: -1 })
        .populate("subscriber.userId");
      res.apiResponse(
        true,
        "successfully fetched  income statement prediction ",
        data
      );
    } catch (err) {
      console.log(err);
      res.apiResponse(false, err.message);
    }
  },
  async getIncomeStatementSummary(req, res) {
    try {
      let query = [
        {
          $match: {
            ...(Boolean(req.query.eventId) && {
              _id: ObjectId(req.query.eventId),
            }),
            ...(Boolean(req.query.stockSymbol) && {
              stockSymbol: req.query.stockSymbol,
            }),
          },
        },
        {
          $unwind: "$subscriber",
        },
        {
          $group: {
            _id: "$_id",
            avg_total_revenue_income: {
              $avg: "$subscriber.total_revenue_income",
            },
            avg_total_operating_expense: {
              $avg: "$subscriber.total_operating_expense",
            },
            avg_EBITDA: { $avg: "$subscriber.EBITDA" },
            avg_net_income: {
              $avg: "$subscriber.net_income",
            },
            name: { $first: "$name" },
            stockSymbol: { $first: "$stockSymbol" },
            endDate: { $first: "$endDate" },
            totalAdvisor: { $sum: 1 },
          },
        },
        { $sort: { endDate: -1 } },
      ];

      const data = await incomeStatement.aggregate(query);
      res.apiResponse(
        true,
        "successfully fetched  income statement prediction summary ",
        data
      );
    } catch (err) {
      console.log(err);
      res.apiResponse(false, err.message);
    }
  },
  async getIncomeStatementHistory(req, res) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "User-Agent":
        " Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
    };

    const data = `code=${req.query.symbol}&InfoType=FinHlr&catType=QuarterlyIncomeStatement`;

    axios
      .post("https://www.topstockresearch.com/rt/StockHistData", data, {
        headers,
      })
      .then((response) => {
        res.apiResponse(
          true,
          "successfully fetched  income statement history ",
          response?.data
        );
      })
      .catch((error) => {
        console.log(error.message);
        res.apiResponse(false, error.message);
      });
  },
};
