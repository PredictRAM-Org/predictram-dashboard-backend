const PortfolioManagementEvent = require("../models/portfolioManagementEvent");
const QueryFilter = require("../utils/QueryFilter");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

module.exports = {
  createPortfolioManagementEvent: async (req, res) => {
    try {
      const portfolioEventCreated = await PortfolioManagementEvent.create(
        req.body
      );

      res.apiResponse(
        true,
        "Portfolio Event Created Successfully",
        portfolioEventCreated
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  submitPortfolioManagementEvent: async (req, res) => {
    try {
      const { id, userId, newPortfolio } = req.body;
      const portfolioEventCreateAndUpdate = PortfolioManagementEvent.findOne({
        _id: new ObjectId(id),
      })
        .then((portfolioEvent) => {
          if (portfolioEvent) {
            const firstPortfolio =
              portfolioEvent.portfolioSubmitted.length === 0;
            if (firstPortfolio) {
              portfolioEvent.portfolioSubmitted.push([newPortfolio]);
            } else {
              const existingPortfolio = portfolioEvent.portfolioSubmitted.find(
                (portfolio) => portfolio[0]?.ownerid?.toString() === userId
              );

              if (existingPortfolio) {
                existingPortfolio.push(newPortfolio);
              } else {
                portfolioEvent.portfolioSubmitted.push([newPortfolio]);
              }
            }
            return portfolioEvent.save();
          }
        })
        .then((updatedPortfolio) => {
          res.apiResponse(
            true,
            "Portfolio updated successfully",
            updatedPortfolio
          );
        })
        .catch((err) => {
          res.apiResponse(false, err.message, err);
        });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getUserPortfolioManagement: async (req, res) => {
    try {
      const { id, userId } = req.query;
      const userPortfolioGet = PortfolioManagementEvent.findOne({
        _id: new ObjectId(id),
      })
        .then((document) => {
          const { portfolioSubmitted } = document;
          if (portfolioSubmitted) {
            const userPortfolio = portfolioSubmitted.find(
              (portfolio) => portfolio[0].ownerid.toString() === userId
            );
            return userPortfolio || [];
          }
        })
        .then((userPortfolio) => {
          res.apiResponse(
            true,
            "Portfolio fetched successfully",
            userPortfolio
          );
        })
        .catch((err) => {
          res.apiResponse(false, err.message, err);
        });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getPortfolioManagementEvent: async (req, res) => {
    try {
      let filterQuery = {};

      if (req.params.eventId) {
        filterQuery._id = req.params.eventId;
      } else {
        const queryFilter = new QueryFilter(["_id", "createdBy"]);
        filterQuery = queryFilter.filter(req.query);
      }
      const skipDocuments = filterQuery.count || 0;
      const portfolioEvents = await PortfolioManagementEvent.find(filterQuery)
        .populate("portfolioSubmitted.ownerid", { name: 1, email: 1 })
        .skip(skipDocuments)
        .limit(20)
        .sort({ endDate: -1 });

      res.apiResponse(
        true,
        "Portfolio Event Fetched Successfully",
        portfolioEvents
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
