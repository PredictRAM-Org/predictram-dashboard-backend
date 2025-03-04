const Mongoose = require("mongoose");
const { SCRAPPER_DB } = require("../../utils/config");
const {
  technicalHourlyDataSchema,
} = require("../../models/technicalHourlyData");

module.exports = {
  async gettechnicalHourlyData(req, res) {
    try {
      const conn = Mongoose.createConnection(SCRAPPER_DB);
      const technicalHourlyDataModel = conn.model(
        "technicalhourdatascrapers",
        technicalHourlyDataSchema
      );
      const { symbols } = req.query;
      const query = {};
      if (symbols) {
        query.symbol = {
          $in: symbols.split(","),
        };
      }

      const technicalHourlyData = await technicalHourlyDataModel.find(query);
      res.apiResponse(
        true,
        "successfully fetched technical hourly data",
        technicalHourlyData
      );
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
