const Mongoose = require("mongoose");
const { livePriceSchema } = require("../../models/livePrice");
const { SCRAPPER_DB } = require("../../utils/config");

module.exports = {
  async getLivePice(req, res) {
    try {
      const conn = Mongoose.createConnection(SCRAPPER_DB);
      const priceModel = conn.model("pricedatascrapers", livePriceSchema);
      const { symbols } = req.query;
      const query = {};

      if (symbols) {
        query.symbol = {
          $in: symbols?.split(","),
        };
      }
      const price = await priceModel.find(query, {
        symbol: 1,
        Previous_Price: 1,
        Price: 1,
        Price_Change: 1,
      });
      res.apiResponse(true, "successfully fetched live price", price);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
