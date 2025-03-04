const mongoose = require("mongoose");

const recipentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false },
);

const emailGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startdate: { type: Date, required: true },
    enddate: { type: Date, required: true },
    recipients: { type: [recipentSchema], default: [] },
  },
  { collection: "EmailGroup", versionKey: false, timestamps: true },
);

module.exports = mongoose.model("EmailGroup", emailGroupSchema);
