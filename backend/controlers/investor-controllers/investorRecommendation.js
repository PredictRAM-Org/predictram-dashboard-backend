const Event = require("../../models/events");
const { firstDay, lastDay } = require("../../utils/DateTimeService");
const { fyersQuotesService } = require("../broker/fyersControler");
module.exports = {
  getStockRecommendation: async (req, res) => {
    try {
      const topStocksFilter = [
        {
          $match: {
            enddate: {
              $gte: firstDay,
              $lte: lastDay,
            },
          },
        },

        { $unwind: "$subscriber" },
        { $unwind: "$subscriber.topgainers" },
        {
          $group: {
            _id: {
              id: "$_id",
              symbol: "$subscriber.topgainers.symbol",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $project: {
            _id: 0,
            symbol: "$_id.symbol",
            id: "$_id.id",
            count: "$count",
          },
        },
        {
          $group: {
            _id: "$id",
            stocks: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            _id: "$_id",
            topstocks: {
              $slice: ["$stocks", 3],
            },
          },
        },
      ];

      const topStocks = await Event.aggregate(topStocksFilter);

      const topStocksWithPrice = [];

      for (let { topstocks, _id } of topStocks) {
        const symbolDataMap = new Map();
        topstocks.forEach((stock) => {
          const symbol = `NSE:${stock.symbol}-EQ`;
          symbolDataMap.set(symbol, stock);
        });

        let data;
        try {
          const livePrice = await fyersQuotesService(
            Array.from(symbolDataMap.keys())
          );

          data = livePrice.d.map((liveP) => {
            const data = symbolDataMap.get(liveP.n);
            return { ...data, livePrice: liveP.v.lp };
          });
        } catch (err) {
          console.log();
          data = topstocks;
        }

        topStocksWithPrice.push({ _id, topstocks: data });
      }

      res.apiResponse(
        true,
        "stock recommendation fetched successfully",
        topStocksWithPrice
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getSectorRecommendation: async (req, res) => {
    try {
      const topSectorFilter = [
        {
          $match: {
            enddate: {
              $gte: firstDay,
              $lte: lastDay,
            },
          },
        },
        { $unwind: "$subscriber" },
        {
          $group: {
            _id: {
              id: "$_id",
              sector: "$subscriber.bestsector",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        {
          $group: {
            _id: "$_id.id",
            sector: { $first: "$_id.sector" },
            count: { $first: "$count" },
          },
        },
      ];

      const topSectors = await Event.aggregate(topSectorFilter);
      res.apiResponse(
        true,
        "sector recommendation fetched successfully",
        topSectors
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
