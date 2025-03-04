const EventPortfolio = require("../models/eventPortfolio");
const { ObjectId } = require("mongoose").Types;
const mutualFund = require("../models/mutualFund");
const { fyersQuotesService } = require("./broker/fyersControler");

module.exports = {
  createEventPortfolio: async (req, res) => {
    try {
      const exist = await EventPortfolio.exists({
        eventId: ObjectId(req.body?.eventId),
        ownerId: ObjectId(req.body?.userId),
      });
      if (exist) {
        throw new Error(
          "You have already created portfolio against this event"
        );
      }
      const eventPortfolio = await EventPortfolio.create(req.body);
      res.apiResponse(true, "portfolio is saved", eventPortfolio);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  getEventPortfolio: async (req, res) => {
    try {
      const query = req.query;
      // group by userId,eventId
      const eventPortfolios = await EventPortfolio.find(query).populate(
        "mutualFunds"
      );

      const updatedPortfolioPromise = eventPortfolios.map(
        async (eventPortfolio) => {
          const symbols = eventPortfolio
            ?.toObject()
            ?.stocks?.map((stock) => `NSE:${stock.symbol}-EQ`);

          const livePrice = await fyersQuotesService(symbols);

          const stocks = eventPortfolio?.toObject()?.stocks?.map((stock) => {
            const liveP = livePrice?.d?.find(
              (d) => d?.n === `NSE:${stock.symbol}-EQ`
            );
            return { ...stock, livePrice: liveP?.v?.lp || 0 };
          });

          return { ...eventPortfolio?.toObject(), stocks };
        }
      );

      const updatedPortfolios = await Promise.all(updatedPortfolioPromise);

      res.apiResponse(
        true,
        "portfolio successfully fetched",
        updatedPortfolios
      );
    } catch (err) {
      console.log(err);
      res.apiResponse(false, err.message);
    }
  },
};
