const sectorRatio = require("../models/sectorRatio");

module.exports = {
  getAllSector: async (req, res) => {
    try {
      const data = await sectorRatio.find({}, { sector: 1 });
      res.apiResponse(true, null, data);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getSectorRatio: async (req, res) => {
    try {
      const { id } = req.query;
      const data = await sectorRatio.findById(id);
      res.apiResponse(true, "succesfully fetched sector ratio", data);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
