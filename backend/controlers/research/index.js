const Research = require("../../models/research");
module.exports = {
  ratepost: async (req, res) => {
    try {
      await Research.findByIdAndUpdate(req.body.id, { rate: req.body.value });
      res.send();
    } catch (error) {
      console.log(error.message);
    }
  },
};
