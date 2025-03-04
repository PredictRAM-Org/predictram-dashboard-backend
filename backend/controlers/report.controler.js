const events = require("../models/events");
const portfolioManagementEvent = require("../models/portfolioManagementEvent");
const { ObjectId } = require("mongoose").Types;

module.exports = {
  getEventSubscriberReport: async (req, res) => {
    try {
      const filter = req.query;

      const query = [
        {
          $match: {
            ...(filter?.event && { _id: ObjectId(filter?.event) }),
          },
        },
        {
          $unwind: "$subscriber",
        },
        {
          $project: {
            name: 1,
            subscriber: 1,
          },
        },
        {
          $match: {
            ...(filter?.startDate &&
              filter?.endDate && {
                "subscriber.createdAt": {
                  $gte: new Date(filter?.startDate),
                  $lte: new Date(filter?.endDate),
                },
              }),
          },
        },
        {
          $lookup: {
            from: "Users",
            localField: "subscriber._id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ];

      const eventSubscribers = await events.aggregate(query);
      res.apiResponse(true, "Event Subscriber Report", eventSubscribers);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  getEventPortfolioReport: async (req, res) => {
    try {
      const filter = req.query;

      const query = [
        {
          $match: {
            ...(filter?.event && { _id: ObjectId(filter?.event) }),
          },
        },
        { $unwind: "$portfolioSubmitted" },
        { $unwind: "$portfolioSubmitted" },
        // do start and end date filter
        {
          $group: {
            _id: {
              ownerid: "$portfolioSubmitted.ownerid",
              id: "$_id",
            },
            portfolio: { $push: "$portfolioSubmitted" },
            idealRisk: { $first: "$idealRisk" },
            portfolioRisk: { $first: "$portfolioRisk" },
            title: { $first: "$title" },
            totalPortfolioPrice: {
              $first: "$totalPortfolioPrice",
            },
          },
        },
        {
          $lookup: {
            from: "Users",
            localField: "_id.ownerid",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: "$owner" },
      ];

      const eventPortfolios = await portfolioManagementEvent.aggregate(query);
      res.apiResponse(true, "Event Portfolio Report", eventPortfolios);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
