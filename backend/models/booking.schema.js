const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  investorId: {
    type: mongoose.Types.ObjectId,
    ref: "Investors",
  },
  investorDeails: {
    type: Object,
  },
  advisorId: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
  },
  scheduledDate: {
    type: String,
  },
  scheduledFromTime: {
    type: String,
  },
  scheduledToTime: {
    type: String,
  },
  meetLink: {
    type: String,
  },
});

module.exports = mongoose.model("Bookings", bookingSchema);
