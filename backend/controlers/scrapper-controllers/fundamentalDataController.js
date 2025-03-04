const Mongoose = require("mongoose");
const { SCRAPPER_DB } = require("../../utils/config");
const { fundamentalDataSchema } = require("../../models/fundamentalData");

module.exports = {
  async getFundamentalData(req, res) {
    try {
      const conn = Mongoose.createConnection(SCRAPPER_DB);
      const fundamentalDataModel = conn.model(
        "fundamentaldatascrapers",
        fundamentalDataSchema
      );
      const { symbols } = req.query;
      const query = {};
      if (symbols) {
        query.symbol = {
          $in: symbols.split(","),
        };
      }
      const fundamentalData = await fundamentalDataModel.find(query);
      res.apiResponse(
        true,
        "successfully fetched technical data",
        fundamentalData
      );
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
