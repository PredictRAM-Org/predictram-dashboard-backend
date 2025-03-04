const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const sessionRegisterSchema = new mongoose.Schema(
  {
    sessionDetailsId: { type: ObjectId, ref: "session", required: true },
    userId: { type: ObjectId, ref: "Users", required: true },
  },
  { timestamps: true, versionKey: false, collection: "sessionRegister" }
);

module.exports = mongoose.model("sessionRegister", sessionRegisterSchema);
