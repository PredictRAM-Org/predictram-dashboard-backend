const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Enums = require("../utils/enums");
const subScriberSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, ref: "Users" },
    bestsector: { type: String, required: true },
    worstsector: { type: String, enum: Enums.SECTORS },
    topgainers: [
      {
        symbol: String,
        value: Number,
        impact: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
        category: {
          type: String,
          enum: [
            "Very Conservative",
            "Conservative",
            "Moderate",
            "Aggressive",
            "Very Aggressive",
          ],
        },
      },
    ],
    etf: { type: String },
    forecast: { type: Number, default: 0 },
    toplosers: [{ symbol: String, value: Number }],
    totalgainer: { type: Number, default: 0 },
    totallosers: { type: Number, default: 0 },
    portfolio: { type: Number, default: 0 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false, versionKey: false }
);

const riaSchema = new Schema(
  {
    name: String,
    regno: String,
  },
  { _id: false }
);

const eventSchema = new Schema(
  {
    name: String,
    lastvalue: String,
    previousvalue: String,
    forecastvalue: String,
    details: String,
    startdate: Date,
    enddate: Date,
    subscriber: [subScriberSchema],
    image: String,
    polygontokenaddress: String,
    polygonportfolioaddress: String,
    kardiatokenaddress: String,
    kardiaportfolioaddress: String,
    eventsymbol: String,
    isPublic: {
      type: Boolean,
      required: true,
      default: true,
      description: "to identify if the event is for users or pre_users",
    },
    topgainers: [String],
    tags: [String],
    file: { type: String },
    stockFile: { type: String },
    sectorAnalysisFile: { type: String },
    futureStocks: {
      type: String,
    },
    ria: [riaSchema],
  },
  { collection: "events", versionKey: false }
);
eventSchema.methods.subscribe = function (data) {
  try {
    let subscriber = this.subscriber;
    if (subscriber.length == 0) {
      subscriber.push(data);
    } else {
      const isExisting = subscriber.findIndex(
        (subscribers) => subscribers.id == data._id
      );
      if (isExisting == -1) subscriber.push(data);
      else {
        subscriber[isExisting] = data;
      }
    }
    this.save();
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = mongoose.model("events", eventSchema);
