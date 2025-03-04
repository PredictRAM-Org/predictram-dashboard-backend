const eventStocksInfo = require("../models/eventStocksInfo");

module.exports = {
  createEventStockInfo: async (req, res) => {
    try {
      const stockInfo = await eventStocksInfo.create(req.body);
      res.apiResponse(true, "Stock Info added", stockInfo);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  getEventStockInfo: async (req, res) => {
    try {
      const filter = req.query;
      const select = {};
      if (filter.StockSymbol) {
        const symbols = filter.StockSymbol.split(",");
        filter.$or = symbols.map((symbol) => ({
          StockSymbol: { $regex: symbol, $options: "i" },
        }));
        delete filter.StockSymbol;
      }
      if (filter.event) {
        filter.event = { $in: filter.event.split(",") };
      }

      if (filter?.select) {
        filter.select?.split(",")?.map((key) => {
          select[key] = 1;
        });
        delete filter.select;
      }

      const stockInfo = await eventStocksInfo.find(
        { ...filter },
        { ...select }
      );
      res.apiResponse(true, "Stock Info fetched", stockInfo);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  updateEventStockInfo: async (req, res) => {
    try {
      const id = req.params.id;
      const stockInfo = await eventStocksInfo.findByIdAndUpdate(id, {
        ...req.body,
      });
      res.apiResponse(true, "Stock Info updated", stockInfo);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  deleteEventStockInfo: async (req, res) => {
    try {
      const id = req.query.ids;
      const filter = {};
      if (id) {
        filter._id = { $in: id.split(",") };
      }

      const stockInfo = await eventStocksInfo.deleteMany(filter);
      res.apiResponse(true, "Stock Info deleted", stockInfo);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
