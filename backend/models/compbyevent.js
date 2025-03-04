const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const compbyeventSchema = new Schema(
    {
        companyname:{type:String},
        industry:{type:String},
        mktcap:{type:Number},
        event:{type:String}
    },
  { collection: "compbyevent", versionKey: false }
);
module.exports = mongoose.model("compbyevent", compbyeventSchema);