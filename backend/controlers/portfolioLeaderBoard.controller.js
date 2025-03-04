const portfolioLeaderBoard = require("../models/portfolioLeaderBoard");

module.exports = {
  createPortfolioLeaderBoard: async (req, res) => {
    try {
      const newPortfolioLeaderBoard = await portfolioLeaderBoard.create({
        ...req.body,
      });
      res.apiResponse(true, "your response submitted", newPortfolioLeaderBoard);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  getPortfolioLeaderBoard: async (req, res) => {
    try {
      const filter = req.query;

      if (!!filter?.startDate && !!filter?.endDate) {
        filter.createdAt = {
          $gte: new Date(filter?.startDate),
          $lte: new Date(filter?.endDate),
        };
        delete filter?.startDate;
        delete filter?.endDate;
      }

      if (filter?.showPoints) {
        delete filter?.showPoints;
        const leaderboardPoints = await portfolioLeaderBoard.aggregate([
          {
            $match: {
              acceptedBy: {
                $exists: true,
              },
              ...filter,
            },
          },
          {
            $group: {
              _id: "$advisor",
              acceptedCount: {
                $sum: 1,
              },
            },
          },
          {
            $lookup: {
              from: "Users",
              localField: "_id",
              foreignField: "_id",
              as: "advisor",
            },
          },
          { $unwind: "$advisor" },
          {
            $project: {
              acceptedCount: "$acceptedCount",
              name: "$advisor.name",
              id: "$advisor._id",
            },
          },
        ]);

        return res.apiResponse(
          true,
          "portfolio leader board",
          leaderboardPoints
        );
      }

      const leaderboard = await portfolioLeaderBoard.find({
        ...filter,
      });

      res.apiResponse(true, "portfolio leader board", leaderboard);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
