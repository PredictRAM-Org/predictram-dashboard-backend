const Research = require("../models/research");
const redisClient = require("../utils/redisCache");
const QueryParamsValidator = require("../utils/QueryParamsValidator");
const { formatDate } = require("../utils/DateTimeService");

module.exports = {
  leaderboard: async (req, res) => {
    try {
      const count = req.query.count - 1 || 0;
      const skip = count * 10;
      const limit = 10;

      let match = {};
      if (req.query.name) {
        match.name = { $regex: req.query.name, $options: "i" };
      }

      const cacheKey = `leaderboard_${JSON.stringify(req.query)}`;

      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        return res.apiResponse(true, null, JSON.parse(cachedResult));
      }

      const result = await Research.aggregate([
        // Group documents by userId
        {
          $group: {
            _id: "$userId",
            likes: { $sum: "$rate" },
            totalPaperSubmitted: { $sum: 1 },
            sharePoints: {
              $sum: { $cond: [{ $eq: ["$isShared", true] }, 1, 0] },
            },
          },
        },
        // Lookup user details
        {
          $lookup: {
            from: "Users",
            localField: "_id",
            foreignField: "_id",
            as: "string",
            pipeline: [{ $project: { name: 1, email: 1, image: 1, _id: 1 } }],
          },
        },
        {
          $unwind: "$string",
        },
        {
          $match: {
            ...(req.query.name
              ? { "string.name": { $regex: req.query.name, $options: "i" } }
              : {}),
          },
        },
        // Lookup portfolioScore
        {
          $lookup: {
            from: "portfolioScore",
            localField: "_id",
            foreignField: "userId",
            as: "portfolioScore",
          },
        },
        // Calculate portfolioScore sum
        {
          $addFields: {
            portfolioScore: {
              $sum: "$portfolioScore.portfolioScore",
            },
          },
        },
        // Project required fields
        {
          $project: {
            name: "$string.name",
            email: "$string.email",
            image: "$string.image",
            id: "$string._id",
            likes: 1,
            totalPaperSubmitted: 1,
            sharePoints: 1,
            portfolioScore: 1,
          },
        },
        // Add totalScore field
        {
          $addFields: {
            totalScore: { $add: ["$likes", "$portfolioScore", "$sharePoints"] },
          },
        },
        // Sort by totalScore
        {
          $sort: {
            totalScore: -1,
          },
        },
        // Paginate results
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            totalUsers: [{ $count: "count" }],
          },
        },
      ]);

      const data = result[0].data;
      const [totalUsers] = result[0].totalUsers;
      await redisClient.setEx(
        cacheKey,
        3600 * 6,
        JSON.stringify({ data, totalUsers })
      );

      res.apiResponse(true, null, { data, totalUsers });
    } catch (error) {
      console.log(error.message);
    }
  },

  leaderboardByDate: async (req, res) => {
    const requiredQueryParams = new QueryParamsValidator([
      "fromDate",
      "toDate",
    ]);
    requiredQueryParams.validate(req.query);

    const fromDate = new Date(req.query.fromDate);
    const toDate = new Date(req.query.toDate);
    const count = req.query.count - 1 || 0;
    const skip = count * 10;
    const limit = 10;

    const cacheKey = `leaderboard_date_${JSON.stringify({
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate),
      count,
      ...req.query,
    })}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return res.apiResponse(true, null, JSON.parse(cachedResult));
    }

    try {
      const result = await Research.aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate, $lte: toDate },
            // ...(req.query.name
            //   ? { name: { $regex: req.query.name, $options: "i" } }
            //   : {}),
          },
        },
        {
          $group: {
            _id: "$userId",
            likes: { $sum: "$rate" },
            totalPaperSubmitted: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "Users",
            localField: "_id",
            foreignField: "_id",
            as: "string",
            pipeline: [{ $project: { name: 1, image: 1, _id: 1 } }],
          },
        },
        {
          $addFields: {
            string: { $arrayElemAt: ["$string", 0] },
          },
        },
        {
          $match: {
            ...(req.query.name
              ? { "string.name": { $regex: req.query.name, $options: "i" } }
              : {}),
          },
        },
        {
          $lookup: {
            from: "portfolioScore",
            localField: "_id",
            foreignField: "userId",
            as: "portfolioScore",
            pipeline: [
              {
                $match: {
                  createdAt: { $gte: fromDate, $lte: toDate },
                },
              },
              { $project: { portfolioScore: 1 } },
            ],
          },
        },
        {
          $project: {
            name: "$string.name",
            image: "$string.image",
            id: "$string._id",
            totalPaperSubmitted: 1,
            likes: 1,
            portfolioScore: 1,
          },
        },
        {
          $addFields: {
            portfolioScore: { $sum: "$portfolioScore.portfolioScore" },
            totalScore: {
              $add: ["$likes", { $sum: "$portfolioScore.portfolioScore" }],
            },
          },
        },
        {
          $sort: { totalScore: -1 },
        },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            totalUsers: [{ $count: "count" }],
          },
        },
      ]);

      const data = result[0].data;
      const [totalUsers] = result[0].totalUsers;

      await redisClient.setEx(
        cacheKey,
        7200,
        JSON.stringify({ data, totalUsers })
      );

      res.apiResponse(true, null, { data, totalUsers });
    } catch (error) {
      console.log(error.message);
    }
  },

  // leaderboardByLikes: async (req, res) => {
  //   try {
  //     const data = await Research.aggregate([
  //       {
  //         $group: {
  //           _id: "$userId",
  //           likes: {
  //             $count: {},
  //           },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "Users",
  //           localField: "_id",
  //           foreignField: "_id",
  //           as: "user",
  //         },
  //       },
  //       {
  //         $unwind: "$likes",
  //       },
  //       {
  //         $sort: {
  //           likes: -1,
  //         },
  //       },
  //     ]);
  //     res.send({ success: true, data });
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // },
  customLeaderBoard: async (req, res) => {
    try {
      const requiredQueryParams = new QueryParamsValidator([
        "fromDate",
        "toDate",
      ]);
      requiredQueryParams.validate(req.query);

      const fromDate = new Date(req.query.fromDate);
      const toDate = new Date(req.query.toDate);
      const count = req.query.count - 1 || 0;
      const skip = count * 10;
      const limit = 10;

      const cacheKey = `leaderboard_custom_${JSON.stringify({
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        ...(req.query.name ? { name: req.query.name } : {}),
        count,
      })}`;

      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        return res.apiResponse(true, null, JSON.parse(cachedResult));
      }

      const result = await Research.aggregate([
        // Combine initial match with filtering by name
        {
          $match: {
            createdAt: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        // Group by userId and calculate likes and totalPaperSubmitted
        {
          $group: {
            _id: "$userId",
            likes: { $sum: "$rate" },
            totalPaperSubmitted: { $sum: 1 },
          },
        },
        // Optimize user lookup
        {
          $lookup: {
            from: "Users",
            localField: "_id",
            foreignField: "_id",
            as: "string",
            pipeline: [{ $project: { name: 1, image: 1, _id: 1 } }],
          },
        },
        {
          $match: {
            ...(req.query.name
              ? { "string.name": { $regex: req.query.name, $options: "i" } }
              : {}),
          },
        },
        // Use arrayElemAt instead of unwind
        {
          $addFields: {
            string: { $arrayElemAt: ["$string", 0] },
          },
        },
        // Optimize portfolioScore lookup with pipeline
        {
          $lookup: {
            from: "portfolioScore",
            localField: "_id",
            foreignField: "userId",
            as: "portfolioScore",
            pipeline: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(req.query.fromDate),
                    $lte: new Date(req.query.toDate),
                  },
                },
              },
              { $project: { portfolioScore: 1 } },
            ],
          },
        },
        // Sum portfolio scores
        {
          $addFields: {
            portfolioScore: { $sum: "$portfolioScore.portfolioScore" },
          },
        },
        // Project the required fields
        {
          $project: {
            name: "$string.name",
            image: "$string.image",
            id: "$string._id",
            totalPaperSubmitted: 1,
            likes: 1,
            portfolioScore: 1,
          },
        },
        // Add totalScore field
        {
          $addFields: {
            totalScore: { $add: ["$likes", "$portfolioScore"] },
          },
        },
        // Sort by totalScore
        {
          $sort: { totalScore: -1 },
        },
        // Paginate results using $facet
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            totalUsers: [{ $count: "count" }],
          },
        },
      ]);

      const data = result[0].data;
      const [totalUsers] = result[0].totalUsers;

      await redisClient.setEx(
        cacheKey,
        7200,
        JSON.stringify({ data, totalUsers })
      );

      res.apiResponse(true, null, { data, totalUsers });
    } catch (err) {
      console.log(err.message);
      res.status(400).send({ success: false, message: err.message });
    }
  },
};
