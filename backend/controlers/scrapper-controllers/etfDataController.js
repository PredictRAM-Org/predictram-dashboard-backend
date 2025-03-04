const Mongoose = require("mongoose");
const { SCRAPPER_DB } = require("../../utils/config");
const { etfDataSchema } = require("../../models/etfData");

module.exports = {
  async getEtfData(req, res) {
    try {
      const conn = Mongoose.createConnection(SCRAPPER_DB);
      const etfDataModel = conn.model("etfDataScraper", etfDataSchema);
      const { symbols } = req.query;
      const query = {};
      if (symbols) {
        query.symbol = {
          $in: symbols.split(","),
        };
      }
      const etfData = await etfDataModel.find(query);
      res.apiResponse(true, "successfully fetched etf data", etfData);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
