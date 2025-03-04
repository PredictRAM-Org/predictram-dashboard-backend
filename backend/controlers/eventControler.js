const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const Joi = require("joi");
const Events = require("../models/events");
const Price = require("../models/price");
const { signTransaction } = require("../contracts/signer");
const { get } = require("axios");
const QueryFilter = require("../utils/QueryFilter");

module.exports = {
  getEvents: async (req, res) => {
    try {
      const queryFilter = new QueryFilter([
        "_id",
        "name",
        "startdate",
        "enddate",
        "isPublic",
      ]);
      const filteredParams = queryFilter.filter(req.query);

      if (!!filteredParams?.startdate) {
        filteredParams.startdate = { $gt: new Date(filteredParams.startdate) };
      }
      if (!!filteredParams?.enddate) {
        filteredParams.enddate = { $lte: new Date(filteredParams.enddate) };
      }
      if (!!filteredParams?.isPublic) {
        filteredParams.isPublic = filteredParams?.isPublic === "true";
      }
      if (!!filteredParams?._id) {
        filteredParams._id = ObjectId(filteredParams._id);
      }
      console.log(filteredParams);
      const events = await Events.aggregate()
        .match({
          ...filteredParams,
        })
        .project({
          forecastvalue: 1,
          file: 1,
          stockFile: 1,
          sectorAnalysisFile: 1,
          futureStocks: 1,
          image: 1,
          name: 1,
          enddate: 1,
          startdate: 1,
          lastvalue: 1,
          previousvalue: 1,
          portfolioaddress: 1,
          polygontokenaddress: 1,
          kardiatokenaddress: 1,
          subscriber: {
            $filter: {
              input: "$subscriber",
              as: "sub",
              cond: { $eq: ["$$sub._id", req.user._id] },
            },
          },
        })
        .sort({ enddate: -1 })
        .limit(50);

      const totalEvent = await Events.find().count();
      res.send({ events, totalEvent });
    } catch (error) {
      console.log(error.message);
    }
  },

  getEventChartData: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["tags", "startdate", "isPublic"]);
      const filteredParams = queryFilter.filter(req.query);

      if (!!filteredParams?.tags) {
        filteredParams.tags = { $all: filteredParams?.tags };
      }
      if (!!filteredParams?.startdate) {
        filteredParams.startdate = { $gte: new Date(filteredParams.startdate) };
      }
      if (!!filteredParams?.isPublic) {
        filteredParams.isPublic = filteredParams?.isPublic === "true";
      }

      const events = await Events.aggregate()
        .match({
          ...filteredParams,
        })
        .project({
          forecastvalue: 1,
          name: 1,
          startdate: 1,
          lastvalue: 1,
          previousvalue: 1,
        })
        .sort({ startdate: 1 });

      res.apiResponse(true, "Event chartdata fetched..", events);
    } catch (error) {
      res.apiResponse(false, "Event chartdata fetching failed..");
    }
  },

  getCurrentEvents: async (req, res) => {
    try {
      const data = await Events.find(
        {
          isPublic: req.query.isPublic,
          enddate: {
            $gte: new Date(),
          },
        },
        { name: 1 }
      );

      res.send(data);
    } catch (error) {
      console.log(error.message);
    }
  },

  getTaggedEvents: async (req, res) => {
    try {
      const events = await Events.aggregate()
        .match({ tags: { $eq: req.body.tag } })
        .project({
          forecastvalue: 1,
          image: 1,
          name: 1,
          enddate: 1,
          lastvalue: 1,
          previousvalue: 1,
          portfolioaddress: 1,
          polygontokenaddress: 1,
          kardiatokenaddress: 1,
          tags: 1,
          subscriber: {
            $filter: {
              input: "$subscriber",
              as: "sub",
              cond: { $eq: ["$$sub._id", req.user._id] },
            },
          },
        })
        .sort({ enddate: -1 })
        .limit(50);
      res.send(events);
    } catch (error) {
      console.log(error.message);
    }
  },

  getEvent: async (req, res) => {
    const events = await Events.aggregate()
      .match({ _id: mongoose.Types.ObjectId(req.body.id) })
      .project({
        forecastvalue: 1,
        stockFile: 1,
        sectorAnalysisFile: 1,
        futureStocks: 1,
        name: 1,
        image: 1,
        enddate: 1,
        lastvalue: 1,
        details: 1,
        previousvalue: 1,
        tags: 1,
        polygontokenaddress: 1,
        kardiatokenaddress: 1,
        polygonportfolioaddress: 1,
        kardiaportfolioaddress: 1,
        subscriber: {
          $filter: {
            input: "$subscriber",
            as: "sub",
            cond: { $eq: ["$$sub._id", req.user._id] },
          },
        },
      });
    res.send(events);
  },

  getEventPrice: async (req, res) => {
    try {
      if (!!req.query.id) {
        const event = await Events.findById(req.query.id).select(
          "-_id portfolioaddress topgainers"
        );
        if (event.topgainers.length == 5) {
          const price = await Price.findOne({ data: 1 }).select("-_id dict");
          let currentprice = 0;
          event.topgainers.forEach((i) => (currentprice += price.dict[i]));
          res.status(200).send({ currentprice });
        }
      } else {
        res.status(400).send({ message: "Event has not ended" });
      }
    } catch (e) {
      res.status(500).send();
    }
  },

  purchaseEvent: async (req, res) => {
    try {
      // purchase is the inr user want to pay
      // account is the address of the user
      // id is the event id
      const schema = {
        id: Joi.string().required(),
        purchase: Joi.number().required(),
        account: Joi.string().required(),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error) {
        return res.status(400).send(result.error.details[0].message);
      }
      const event = await Events.findById(req.body.id).select(
        "-_id kardiaportfolioaddress polygonportfolioaddress topgainers"
      );
      if (event.topgainers.length == 5) {
        const price = await Price.findOne({ data: 1 }).select("-_id dict");
        let currentprice = 0;
        event.topgainers.forEach((i) => (currentprice += price.dict[i]));
        const { data } = await get(
          "https://http-api.livecoinwatch.com/tools/conversion?from=INR&to=KAI"
        );
        const maticUserPay = currentprice * data.conversion * req.body.purchase;
        const tokensUserGet = req.body.purchase;
        const sign = await signTransaction(
          event.kardiaportfolioaddress,
          req.body.account,
          maticUserPay,
          tokensUserGet
        );
        res.send({
          sign,
        });
      }
    } catch (e) {
      console.log(e.message);
      res.status(500).send();
    }
  },

  saveEvent: async (req, res) => {
    try {
      let data = req.body.data;
      const schema = {
        topgainers: Joi.array().max(5).required(),
        toplosers: Joi.array().min(5).optional(),
        totalgainer: Joi.number().required(),
        totallosers: Joi.number().optional(),
        portfolio: Joi.number().required(),
        forecast: Joi.number().required(),
        bestsector: Joi.string().required(),
        worstsector: Joi.string().optional(),
        etf: Joi.string().required(),
      };
      const result = Joi.validate(data, schema);
      if (result.error)
        return res.status(400).send(result.error.details[0].message);
      data["_id"] = req.user.id;
      const event = await Events.findById(req.body.id);
      if (event) {
        event.subscribe(data);
      } else {
        return res.status(400).send();
      }
      res.send();
    } catch (error) {
      console.log(error.message);
      res.status(500).send();
    }
  },
};
