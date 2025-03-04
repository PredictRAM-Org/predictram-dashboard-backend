const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cpiSchema = new Schema(
    {
        serial_no: String,
        month: String,
        commoditydescription:  String,
        provisional_final:  String,
        rural_current_month:  String,
        rural_inflation_y_o_y:  String,
        urban_current_month:  String,
        urban_inflation_y_o_y:  String,
        combined_current_month:  String,
        combined_inflation_y_o_y:  String
    },
  { collection: "cpi", versionKey: false }
);
module.exports = mongoose.model("cpi", cpiSchema);