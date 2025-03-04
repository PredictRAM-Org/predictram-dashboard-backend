const DataService = require("../services/dataService.js");
module.exports = {
  getEtfs: async (req, res) => {
    try {
      const { category } = req.query;
      const data = DataService.getEtfs(category);
      res.apiResponse(true, "ETF data  fetched successfully", data);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getBonds: async (req, res) => {
    try {
      const { category } = req.query;
      const data = DataService.getBonds(category);
      res.apiResponse(true, "Bonds data  fetched successfully", data);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getCategorizedStocks: async (req, res) => {
    try {
      const { category } = req.query;
      const data = DataService.getCategorizedStocks(category);
      res.apiResponse(
        true,
        "Categorized Stocks data  fetched successfully",
        data
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
