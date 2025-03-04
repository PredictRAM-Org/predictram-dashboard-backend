const BondQnA = require("../models/bondQnA");

module.exports = {
  createBondQnA: async (req, res) => {
    try {
      const bondQnA = await BondQnA.create(req.body);
      res.apiResponse(true, "Form Submitted", bondQnA);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  getBondQnA: async (req, res) => {
    try {
      const filter = req.query;
      const bondQnA = await BondQnA.find(filter);
      res.apiResponse(true, "bond QnA", bondQnA);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
