const Session = require("../../models/session");
const QueryFilter = require("../../utils/QueryFilter");
const mongoose = require("mongoose");
const sessionRegister = require("../../models/sessionregister");
const EmailService = require("../../services/EmailService");
const DateTimeService = require("../../services/DateTimeService");
const cron = require("node-cron");
const axios = require("axios");
const schedule = require("node-schedule");
const CalendarService = require("../../services/CalendarService");
const { ObjectId } = mongoose.Types;

module.exports = {
  createSession: async (req, res) => {
    try {
      const newSession = new Session(req.body);
      const session = await Session.create(newSession);
      res.apiResponse(true, "Session created successfully", session);
    } catch (err) {
      console.log(err);
      res.apiResponse(false, "Session was not created successfully");
    }
  },
  getSession: async (req, res) => {
    try {
      const queryFilter = new QueryFilter([
        "id",
        "title",
        "duration",
        "tags",
        "paid",
        "instructor",
        "date",
      ]);
      const filteredParams = queryFilter.filter(req.query);
      const query = {};
      if (!!filteredParams.id) {
        query._id = mongoose.Types.ObjectId(filteredParams.id);
      }
      if (!!filteredParams.title) {
        query.title = filteredParams.title;
      }
      if (!!filteredParams.duration) {
        query.duration = filteredParams.duration;
      }
      if (!!filteredParams.tags) {
        query.tags = filteredParams.tags;
      }
      if (filteredParams?.paid === "true") {
        query.fee = { $ne: 0 };
      }
      if (filteredParams?.paid === "false") {
        query.fee = { $eq: 0 };
      }
      if (!!filteredParams.instructor) {
        query.instructor = mongoose.Types.ObjectId(filteredParams.instructor);
      }
      if (!!filteredParams.date) {
        query["scheduledTimeStamp.date"] = new Date(filteredParams.date);
      }

      const sessions = await Session.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: "Users",
            localField: "instructor",
            pipeline: [{ $project: { name: 1, image: 1, _id: 1 } }],
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $lookup: {
            from: "profile",
            localField: "instructor",
            pipeline: [{ $project: { about: 1, _id: 0 } }],
            foreignField: "_id",
            as: "instructorBio",
          },
        },
        {
          $unwind: "$instructorDetails",
        },
        {
          $unwind: "$instructorBio",
        },
      ]);

      res.apiResponse(true, "Sessions fetched successfully", sessions);
    } catch (err) {
      res.apiResponse(false, "Cannot get the Sessions", err);
    }
  },
  getUnAssignedSession: async (req, res) => {
    try {
      const { date, tags } = req.query;
      const query = {
        $or: [
          { "scheduledTimeStamp.date": { $ne: new Date(date) } },
          { "scheduledTimeStamp.date": { $exists: false } },
        ],
      };
      if (tags) {
        query.tags = tags;
      }

      const unAssignedSessions = await Session.find(query);
      res.apiResponse(
        true,
        "Unassigned Session fetched successfully",
        unAssignedSessions
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  updateSession: async (req, res) => {
    try {
      const id = req.params.id;
      const session = await Session.findByIdAndUpdate(id, req.body);
      res.apiResponse(true, "Session updated successfully", session);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  deleteSession: async (req, res) => {
    try {
      const id = req.params.id;
      await Session.findByIdAndDelete(id);
      res.apiResponse(true, "Session deleted successfully");
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  assignSessionOnSpecificDate: async (req, res) => {
    try {
      const { id, date, fromTime, toTime } = req.body;
      const sessionAssigned = await Session.findByIdAndUpdate(
        id,
        {
          assignedOn: new Date().toISOString(),
          scheduledTimeStamp: { date, fromTime, toTime },
        },
        { new: true }
      ).populate("instructor");

      // notifying the instructor when session is assigned
      if (sessionAssigned) {
        const {
          title,
          instructor: { email },
        } = sessionAssigned;
        const emailTemplate = EmailService.generateEmailTemplateCreator(
          title,
          date,
          fromTime,
          toTime,
          ""
        );

        const subjectOfEmail = "Your Session is booked: Session Details Inside";

        const notifyingCreator = await EmailService.sendCustomisedEmail(
          email,
          subjectOfEmail,
          emailTemplate
        );
      }

      // scheduling the cron job for creating the google event

      console.log("api call is happening");
      const response = await axios.get(
        `${process.env.BASE_USER_URL}/sessions/notify-users`,
        { params: { id } }
      );
      console.log(response.data);

      res.apiResponse(true, "Session assigned successfully", sessionAssigned);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  registerForSession: async (req, res) => {
    try {
      const { userId, sessionId } = req.body;
      const session = await sessionRegister.create({
        sessionDetailsId: sessionId,
        userId,
      });

      if (session) {
        const {
          sessionDetailsId: {
            title,
            scheduledTimeStamp: { date, fromTime, toTime },
          },
          userId: { name, email },
        } = await sessionRegister
          .findById(session._id)
          .populate("userId")
          .populate("sessionDetailsId");

        const emailTemplate = EmailService.generateEmailTemplateUser(
          name,
          title,
          date,
          fromTime,
          toTime,
          ""
        );

        const subjectOfEmail =
          "Congrats! You have successfully registered for the session: Session Details Inside";

        const notifyingUser = await EmailService.sendCustomisedEmail(
          email,
          subjectOfEmail,
          emailTemplate
        );
      }
      res.apiResponse(true, "You successfully registered for the session");
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getAvailableSessions: async (req, res) => {
    try {
      const date = new Date();
      const currentDate = new Date(
        `${date.toISOString().split("T")[0]}T00:00:00.000Z`
      );

      const filter = [
        {
          $lookup: {
            from: "sessionRegister",
            localField: "_id",
            foreignField: "sessionDetailsId",
            as: "registrations",
          },
        },
        {
          $lookup: {
            from: "Users",
            localField: "instructor",
            pipeline: [{ $project: { name: 1, image: 1, _id: 0 } }],
            foreignField: "_id",
            as: "instructorDetails",
          },
        },

        {
          $unwind: "$instructorDetails",
        },
        {
          $match: {
            "scheduledTimeStamp.date": {
              $gt: new Date(currentDate),
            },
            registrations: {
              $not: {
                $elemMatch: {
                  userId: ObjectId(req.query.userId || req.user.id),
                },
              },
            },
          },
        },
        {
          $project: {
            registrations: 0,
          },
        },
      ];
      const availableSessions = await Session.aggregate(filter);
      res.apiResponse(
        true,
        "All Available sessions fetched successfully",
        availableSessions
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  getUserRegisterSessions: async (req, res) => {
    try {
      const userId = req.params.userId;
      const sessionId = req.query.sessionId;
      const matchQuery = {};
      if (userId) matchQuery.userId = mongoose.Types.ObjectId(userId);
      if (sessionId)
        matchQuery.sessionDetailsId = mongoose.Types.ObjectId(sessionId);
      const filter = [
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "session",
            localField: "sessionDetailsId",
            foreignField: "_id",
            as: "sessionDetailsId",
          },
        },
        {
          $unwind: "$sessionDetailsId",
        },
        {
          $lookup: {
            from: "Users",
            localField: "sessionDetailsId.instructor",
            pipeline: [{ $project: { name: 1, image: 1, _id: 0 } }],
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $unwind: "$instructorDetails",
        },
      ];
      const registeredSession = await sessionRegister.aggregate(filter);
      res.apiResponse(
        true,
        "Registered sessions fetched successfully",
        registeredSession
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  scheduleSession: async (req, res) => {
    try {
      const { id } = req.query;
      const sessionDetails = await Session.findById(id);

      const notifyRegisteredUsers = async (sessionId, _sessionDetails) => {
        const {
          assignedOn,
          scheduledTimeStamp: { date, fromTime },
        } = _sessionDetails;

        const sessionRegisterDetails = await sessionRegister
          .find({
            sessionDetailsId: sessionId,
            createdAt: {
              $gte: new Date(assignedOn),
              $lte: new Date(
                DateTimeService.getMergeDateAndTimeString(
                  date.toISOString(),
                  DateTimeService.getISOStringFromTime(fromTime)
                )
              ),
            },
          })
          .populate("userId", "email")
          .populate("sessionDetailsId");

        if (sessionRegisterDetails) {
          const registeredUserEmails = sessionRegisterDetails.map((user) => {
            return {
              email: user.userId.email,
            };
          });

          const creatingCalendarEvent = CalendarService.generateGMeetLink(
            _sessionDetails,
            registeredUserEmails
          );

          console.log("Session scheduled successfully");
        } else {
          console.log("No Details found");
        }
      };

      if (sessionDetails) {
        const {
          scheduledTimeStamp: { date, fromTime, toTime },
        } = sessionDetails;

        // create Date object from input date string
        let scheduledDate = new Date(date);

        // set time of Date object to input time string
        const [hours, minutes] = fromTime.split(":").map(Number);
        scheduledDate.setHours(hours);
        scheduledDate.setMinutes(minutes);

        // Scheduling 1 minute before the schedule
        scheduledDate.setMinutes(scheduledDate.getMinutes() - 1);

        const scheduleDateTimeString = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${
          scheduledDate.getMonth() + 1
        } *`;

        console.log(scheduleDateTimeString);

        const task = schedule.scheduleJob(scheduleDateTimeString, () => {
          console.log("Running scheduled job");
          notifyRegisteredUsers(id, sessionDetails);
        });

        res.apiResponse(true, "Session scheduled successfully", {});
      } else {
        res.apiResponse(false, "Session details not found", {});
      }
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
