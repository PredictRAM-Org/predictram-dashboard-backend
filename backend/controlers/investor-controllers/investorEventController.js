const InvestorEvent = require("../../models/investorEventSchema");
const FcmToken = require("../../models/fcmToken");
const InvestorEventService = require("../../services/investorEventService");

module.exports = {
  createInvestorEvent: async (req, res) => {
    try {
      const { eventId, startDate, endDate } = req.body;
      const investorEvent = await InvestorEvent.create({
        eventId,
        startDate,
        endDate,
      });

      await InvestorEventService.sendPushNotification({
        title: "🚀 New Event Alert!",
        body: "Exciting news! We've just added a new event. Click to explore and stay ahead of the game! 📈",
        eventId: investorEvent._id.toString(),
      });

      res.apiResponse(
        true,
        "Investor Event Created Successfully",
        investorEvent
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  saveFcmToken: async (req, res, next) => {
    try {
      const fcmToken = await FcmToken.findOneAndUpdate(
        { token: req.body.token },
        { ...req.body },
        { upsert: true, new: true }
      );
      res.apiResponse(true, "Token Saved Successfully", fcmToken);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  sendPushNotification: async (req, res, next) => {
    try {
      await InvestorEventService.sendPushNotification({
        title: "🚀 New Event Alert!",
        body: "Exciting news! We've just added a new event. Click to explore and stay ahead of the game! 📈",
        eventId: "6643119a10ea0a896e260dbe",
      });

      res.apiResponse(true, "Notification Pushed Successfully");
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  getAllInvestorEvent: async (req, res) => {
    try {
      const count = req.query?.count - 1 || 0;
      const skipDocuments = count * 10;
      const ended = req.query?.ended;

      let filter = {};
      let sortOption = {};
      if (ended === "true") {
        filter.endDate = { $lt: new Date() };
        sortOption.endDate = -1;
      } else if (ended === "false") {
        filter.endDate = { $gte: new Date() };
      }

      const investorEvent = await InvestorEvent.find(filter)
        .limit(10)
        .skip(skipDocuments)
        .populate("eventId", { name: 1, file: 1 })
        .sort(sortOption);

      const totalEvents = await InvestorEvent.countDocuments(filter);

      res.apiResponse(true, "Investor Event Fetched Successfully", {
        investorEvent,
        totalEvents,
      });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  getSpecificInvestorEvent: async (req, res) => {
    try {
      const { id } = req.params;

      const investorEvent = await InvestorEvent.findById(id).populate(
        "eventId",
        { name: 1 }
      );
      res.apiResponse(
        true,
        "Investor Event Fetched Successfully",
        investorEvent
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
