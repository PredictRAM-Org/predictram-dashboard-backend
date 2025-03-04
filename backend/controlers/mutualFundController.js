const mutualFund = require("../models/mutualFund");

module.exports = {
  getMutualFunds: async (req, res) => {
    try {
      const query = req.query;

      const mutualFunds = await mutualFund.find({ ...query });
      return res.apiResponse(
        true,
        "mutual fund fetched successfully",
        mutualFunds
      );
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
