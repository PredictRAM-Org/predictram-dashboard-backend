const Mongoose = require("mongoose");
const { SCRAPPER_DB } = require("../../utils/config");
const { ratioAnalyserSchema } = require("../../models/ratioAnalyser");

module.exports = {
  getRatioAnalyserResult: async (req, res) => {
    try {
      const conn = Mongoose.createConnection(SCRAPPER_DB);
      const ratioAnalyserModel = conn.model(
        "ratio_analyser",
        ratioAnalyserSchema
      );
      const { symbol } = req.query;

      const ratioAnalyserData = await ratioAnalyserModel.find({
        StockName: symbol,
      });
      res.apiResponse(
        true,
        "successfully fetched ratio data",
        ratioAnalyserData
      );
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
