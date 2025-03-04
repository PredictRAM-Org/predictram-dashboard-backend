const InvestorsAccount = require("../../models/investorsAccount");
const QueryFilter = require("../../utils/QueryFilter");

module.exports = {
  gettotalInvestorRefers: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["id"]);
      const filteredParams = queryFilter.filter(req.query);
      const uid = filteredParams.id;
      const data = await InvestorsAccount.find({ referedby: uid }).count();
      res.send({ totalrefers: data });
    } catch (err) {
      res.status(400).send();
    }
  },
};
