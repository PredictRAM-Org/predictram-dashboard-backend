const Etf = require("../models/etf");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const axios = require("axios");
const Events = require("../models/events");

module.exports = {
  createETF: async (req, res, next) => {
    try {
      const { eventId, title } = req.body;
      const existingETF = await Etf.find({ eventId });

      const listofgainers = await Events.aggregate([
        {
          $match: {
            _id: ObjectId(eventId),
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
          $limit: 7,
        },
      ]);

      const topGainers = listofgainers.map((i) => i._id);
      const stockPriceData = listofgainers.map((i) => i.average);

      const etfPrice = stockPriceData.reduce(
        (total, currentValue) => total + currentValue,
        0
      );

      if (!!existingETF.length)
        return res.status(201).json({
          success: true,
          message: "ETF already exists",
        });

      const etfDetails = new Etf({
        eventId,
        title,
        stocks: topGainers,
        createdPrice: Number(etfPrice?.toFixed(2)),
        currentPrice: Number(etfPrice?.toFixed(2)),
      });

      await Etf.create(etfDetails);
      return res.status(201).json({
        success: true,
        message: "ETF created successfully",
      });
    } catch (err) {
      console.log(err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  getETF: async (req, res, next) => {
    try {
      const etfID = req.query.id;

      if (!!etfID) {
        const etfDetails = await Etf.find({
          eventId: mongoose.Types.ObjectId(etfID),
        });
        return res.send(etfDetails);
      }

      const allETF = await Etf.find();
      return res.send(allETF);
    } catch (err) {
      console.log(err.message);
      return res.status(404).send(err.message);
    }
  },

  getEtfCurrentPrice: async (req, res) => {
    const API_KEY = "HVVSRVNJCSZCHP97";
    const BASE_URL = "https://www.alphavantage.co/query";
    try {
      const symbols = req.query.symbols.split(",");
      const functionType = "GLOBAL_QUOTE";
      const promises = symbols.map(async (symbol) => {
        const url = `${BASE_URL}?function=${functionType}&apikey=${API_KEY}&symbol=${symbol}`;
        const response = await axios.get(url);
        return response.data;
      });
      try {
        const stockData = await Promise.all(promises);
        res.send(stockData);
      } catch (error) {
        res.send({ error: error.message });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  deleteETF: async (req, res, next) => {
    try {
      if (!!req.params.id) {
        await Etf.findOneAndDelete({
          eventId: mongoose.Types.ObjectId(req.params.id),
        });
        res.send({ success: true, message: "ETF deleted successfully" });
      }
      next();
    } catch (err) {
      console.log(err.message);
      res.status(400).send(err.message);
    }
  },
};
