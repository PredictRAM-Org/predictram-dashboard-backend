const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ioipSchema = new Schema(
  {
    use_basd_category: String,
    weight : String,
    type : Number,
    '2012_13': String,
    '2013_14': String,
    '2014_15': String,
    '2015_16': String,
    '2016_17': String,
    '2017_18': String,
    '2018_19': String,
    '2019_20': String,
    '2020_21': String,
    '2021_22': String
  },
  { collection: "ioip", versionKey: false }
);
module.exports = mongoose.model("ioip", ioipSchema);