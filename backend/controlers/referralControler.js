const User = require("../models/users");
const QueryFilter = require("../utils/QueryFilter");

module.exports = {
  gettotalrefers: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["id"]);
      const filteredParams = queryFilter.filter(req.query);
      const uid = req.user.id || filteredParams.id;
      const data = await User.find({ referedby: uid }).count();
      res.send({ totalrefers: data });
    } catch (err) {
      res.status(400).send();
    }
  },
};
