const Events = require("../models/events");
const Research = require("../models/research");
const Users = require("../models/users");
const Investors = require("../models/investorsAccount");
const Joi = require("joi");
const Price = require("../models/price");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const cron = require("node-cron");
const _ = require("lodash");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const path = require("path");
// const { deployContracts } = require("../contracts/contract");
const compbyevent = require("../models/compbyevent");
const {
  telegramNotifier,
  telegramDeadlineNotifier,
} = require("../utils/TelegramNotifier");
const CronScheduleService = require("../services/CronScheduleService");
const QueryFilter = require("../utils/QueryFilter");

module.exports = {
  createEvent: async (req, res) => {
    try {
      let {
        forecastvalue,
        lastvalue,
        startdate,
        previousvalue,
        name,
        enddate,
        details,
        eventsymbol,
        image,
        isPublic,
        tags,
      } = req.body;

      if (await Events.findOne({ eventsymbol })) {
        return res.status(400).send("Event Symbol already exists.");
      }

      const event = new Events({
        forecastvalue,
        details,
        lastvalue,
        eventsymbol,
        name,
        isPublic,
        previousvalue,
        enddate,
        startdate,
        image,
        tags,
      });
      const eventDetails = await event.save();

      if (isPublic) {
        telegramNotifier(eventDetails);
        // setting up a cron job to notify before the deadline
        const cronSchedule = CronScheduleService.scheduleCron(
          eventDetails.enddate,
          2
        );

        const task = cron.schedule(cronSchedule, async () => {
          console.log("Notifying for deadline");
          telegramDeadlineNotifier(eventDetails);
        });
      }

      res.send("Event created successfully");
    } catch (error) {
      console.log(error.message);
      res.status(500).send();
    }
  },
  // deploycontract: async (req, res) => {
  //   try {
  //     const { name, eventsymbol } = req.body;
  //     if (name && eventsymbol) {
  //       const event = await Events.findOne({ eventsymbol });
  //       if (event.polygontokenaddress || event.kardiaportfolioaddress)
  //         return res.status(400).send("Already Created");
  //       const listofgainers = await Events.aggregate([
  //         {
  //           $match: {
  //             _id: event._id,
  //           },
  //         },
  //         {
  //           $unwind: {
  //             path: "$subscriber",
  //           },
  //         },
  //         {
  //           $unwind: {
  //             path: "$subscriber.topgainers",
  //             includeArrayIndex: "string",
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: "$subscriber.topgainers.symbol",
  //             value: {
  //               $sum: {
  //                 $subtract: [5, "$string"],
  //               },
  //             },
  //             average: {
  //               $avg: "$subscriber.topgainers.value",
  //             },
  //           },
  //         },
  //         {
  //           $sort: {
  //             value: -1,
  //           },
  //         },
  //         {
  //           $limit: 5,
  //         },
  //       ]);
  //       topgainers = [];
  //       listofgainers.forEach((i) => topgainers.push(i._id));
  //       if (topgainers.length != 5)
  //         return res.status(400).send("Topgainers less then five.");
  //       const {
  //         polygonportfolioaddress,
  //         polygontokenaddress,
  //         kardiaportfolioaddress,
  //         kardiatokenaddress,
  //       } = await deployContracts(name, eventsymbol);
  //       event.polygonportfolioaddress = polygonportfolioaddress;
  //       event.polygontokenaddress = polygontokenaddress;
  //       event.kardiaportfolioaddress = kardiaportfolioaddress;
  //       event.kardiatokenaddress = kardiatokenaddress;
  //       event.topgainers = topgainers;
  //       await event.save();
  //       res.send("Deploy Success");
  //     } else {
  //       res.status(400).send("Provide Name and Symbol");
  //     }
  //   } catch (e) {
  //     console.log(e.message);
  //     res.status(500).send(e.message);
  //   }
  // },
  getevent: async (req, res) => {
    try {
      const event = await Events.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.body.id) } },
        {
          $lookup: {
            from: "Users",
            localField: "subscriber._id",
            foreignField: "_id",
            as: "id",
          },
        },
        {
          $addFields: {
            id: {
              $map: {
                input: "$subscriber",
                as: "m",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$id",
                            cond: {
                              $eq: ["$$this._id", "$$m._id"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                    "$$m",
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            lastvalue: 1,
            previousvalue: 1,
            startdate: 1,
            forecastvalue: 1,
            enddate: 1,
            eventsymbol: 1,
            polygontokenaddress: 1,
            polygonportfolioaddress: 1,
            kardiatokenaddress: 1,
            kardiaportfolioaddress: 1,
            topgainers: 1,
            file: 1,
            stockFile: 1,
            sectorAnalysisFile: 1,
            futureStocks: 1,
            ria: 1,
            id: {
              _id: 1,
              name: 1,
              email: 1,
              image: 1,
              etf: 1,
              status: 1,
              topgainers: 1,
              forecast: 1,
              portfolio: 1,
              createdAt: 1,
            },
          },
        },
      ]);

      const listofgainers = await Events.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(req.body.id),
          },
        },
        {
          $unwind: {
            path: "$subscriber",
          },
        },
        {
          $unwind: {
            path: "$subscriber.topgainers",
            includeArrayIndex: "string",
          },
        },
        {
          $group: {
            _id: "$subscriber.topgainers.symbol",
            value: {
              $sum: {
                $subtract: [5, "$string"],
              },
            },
            average: {
              $avg: "$subscriber.topgainers.value",
            },
          },
        },
        {
          $sort: {
            value: -1,
          },
        },
        {
          $project: {
            _id: 0,
            symbol: "$_id",
            value: 1,
            average: 1,
          },
        },
      ]);
      const { dict } = await Price.findOne({ data: 1 });
      res.send({ event, listofgainers, price: dict });
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  },
  getEvents: async (req, res) => {
    const queryFilter = new QueryFilter(["isPublic"]);
    const filteredParams = queryFilter.filter(req.query);

    if (!!filteredParams?.isPublic) {
      filteredParams.isPublic = filteredParams?.isPublic === "true";
    }

    const events = await Events.aggregate()
      .match(filteredParams)
      .project({
        forecastvalue: 1,
        name: 1,
        enddate: 1,
        lastvalue: 1,
        previousvalue: 1,
      })
      .sort({ enddate: -1 });
    res.send(events);
  },
  deleteEvent: async (req, res) => {
    try {
      const data = await Events.findByIdAndDelete(req.body.id);

      if (data.image) {
        const filelocation = path.resolve(
          __dirname,
          "..",
          "uploads",
          "images",
          data.image
        );
        await unlinkAsync(filelocation);
      }
      res.send("Event Deleted successfully");
    } catch (error) {
      res.send(error.message);
    }
  },
  addcomapnybyevent: async (req, res) => {
    try {
      const { companyname, industry, mktcap, event } = req.body;
      const data = await compbyevent.create({
        companyname,
        industry,
        mktcap,
        event,
      });
      res.send(data);
    } catch (error) {
      console.log(error.message);
    }
  },
  editcomapnybyevent: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await compbyevent.findByIdAndUpdate(id, req.body);
      res.send(data);
    } catch (error) {
      console.log(error.message);
    }
  },
  deletecomapnybyevent: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await compbyevent.findByIdAndDelete(id);
      res.send(data);
    } catch (error) {
      console.log(error.message);
    }
  },

  publishResearchPaper: async (req, res) => {
    try {
      const data = await Research.findByIdAndUpdate(ObjectId(req.body.id), {
        isVerified: true,
      });
      res.send({ data, message: "Paper published successfully" });
    } catch (err) {
      res.status(404).send({ message: err.message });
    }
  },
  getusers: async (req, res) => {
    try {
      const users = await Users.find({});
      res.send(users);
    } catch (error) {
      res.send(error.message);
    }
  },
  getRegisteredUsers: async (req, res) => {
    try {
      const { fromTime, toTime } = req.query;

      const users = await Users.find(
        {
          createdAt: {
            $gte: new Date(fromTime),
            $lte: new Date(toTime),
          },
        },
        {
          name: 1,
          email: 1,
          phone: 1,
          createdAt: -1,
        },
        {
          sort: {
            createdAt: -1,
          },
        }
      );

      res.apiResponse(true, "Users fetched successfully", users);
    } catch (error) {
      res.send(error.message);
    }
  },
  getRegisteredInvestors: async (req, res) => {
    try {
      const { fromTime, toTime } = req.query;

      const investors = await Investors.find(
        {
          firstName: { $exists: true },
          lastName: { $exists: true },
          email: { $exists: true },
          createdAt: {
            $gte: new Date(fromTime),
            $lte: new Date(toTime),
          },
        },
        {
          firstName: 1,
          lastName: 1,
          email: 1,
          mobileNumber: 1,
          createdAt: -1,
          updatedAt: -1,
        },
        {
          sort: {
            createdAt: -1,
          },
        }
      );

      res.apiResponse(true, "Investors fetched successfully", investors);
    } catch (error) {
      res.send(error.message);
    }
  },
  updateEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      const updatedEvent = await Events.findByIdAndUpdate(eventId, {
        ...req.body,
      });
      res.apiResponse(true, "Event Updated Successfully", updatedEvent);
    } catch (err) {
      res.send(err.messgage);
    }
  },
  test: async (req, res) => {
    try {
    } catch (e) {
      console.log(e.message);
    }
  },
};
