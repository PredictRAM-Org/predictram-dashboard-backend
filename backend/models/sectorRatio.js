const mongoose = require("mongoose");
const ratioSchema = mongoose.Schema(
  {
    ratioName: { type: String, required: true },
    ratioDesc: { type: String, required: true },
  },
  { _id: false },
);
const sectorRatioSchema = new mongoose.Schema(
  {
    sector: { type: String, required: true },
    ratio: { type: [ratioSchema], required: true },
  },
  { versionKey: false, collection: "sectorRatio" },
);

module.exports = mongoose.model("sectorRatio", sectorRatioSchema);
