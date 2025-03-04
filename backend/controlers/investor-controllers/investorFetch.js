const Investors = require("../../models/investorsAccount");
const mongoose = require("mongoose");
const QueryFilter = require("../../utils/QueryFilter");
const { ObjectId } = mongoose.Types;

module.exports = {
  getInvestorsByParams: async (req, res) => {
    const queryFilter = new QueryFilter(["_id", "mobileNumber", "email"]);
    const allowedParams = queryFilter.filter(req.query);
    try {
      if (!Object.keys(allowedParams).length) {
        res.apiResponse(false, "No query parameters provided", null);
      } else {
        const data = await Investors.find(allowedParams);
        if (!data) return res.apiResponse(false, "No account found", null);
        res.apiResponse(true, "Account found", data);
      }
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
