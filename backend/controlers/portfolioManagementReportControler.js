const PortfolioManagementReport = require("../models/portfolioManagementReport");
const QueryFilter = require("../utils/QueryFilter");

module.exports = {
  createPortfolioReport: async (req, res, next) => {
    try {
      const existReport = await PortfolioManagementReport.exists({
        userId: req.body.userId,
        event: req.body.event,
      });
      if (existReport) {
        return res.apiResponse(
          false,
          "You already submitted report on this portfolio",
          {}
        );
      }
      const reportData = await PortfolioManagementReport.create(req.body);

      res.apiResponse(
        true,
        "Portfolio Report created successfully",
        reportData
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getPortfolioReport: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["event", "userId"]);
      const allowedParams = queryFilter.filter(req.query);

      const reportData = await PortfolioManagementReport.findOne(
        allowedParams
      ).populate([
        { path: "userId", select: "name image" },
        { path: "event", select: "name" },
      ]);

      res.apiResponse(
        true,
        "Portfolio Report fetched successfully",
        reportData
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  deletePortfolioReport: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["event", "userId"]);
      const allowedParams = queryFilter.filter(req.query);

      const deleteReportData = await PortfolioManagementReport.findOneAndDelete(
        allowedParams
      );

      res.apiResponse(true, "Portfolio Report deleted successfully", {});
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
