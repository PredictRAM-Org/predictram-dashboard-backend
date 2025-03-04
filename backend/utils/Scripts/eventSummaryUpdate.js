const eventSummary = require("../../models/eventSummary");
const InvestorEvent = require("../../models/investorEventSchema");
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.wdfuc.mongodb.net/interns?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const randomNumber = (num) => {
  return Math.floor(Math.random() * num) + 1;
};
const updateEventSummary = async (ended) => {
  try {
    const filter = ended
      ? { endDate: { $lte: new Date() } }
      : { endDate: { $gte: new Date() } };

    const investorEvent = await InvestorEvent.find(filter).select({
      _id: 0,
      eventId: 1,
    });

    const updateQuery = investorEvent.map(({ eventId: event }) => {
      return {
        updateOne: {
          filter: { event },
          update: {
            $inc: {
              totalStocks: randomNumber(1),
              totalPapers: randomNumber(5),
              totalAnalysis: randomNumber(5),
            },
          },
          upsert: true,
        },
      };
    });

    const result = await eventSummary.bulkWrite(updateQuery);
  } catch (err) {
    console.error("Error updating event summary:", err);
  }
};

// updateEventSummary(false);

module.exports = { updateEventSummary };
