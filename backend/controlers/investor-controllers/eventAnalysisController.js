const mongoose = require("mongoose");
const QueryFilter = require("../../utils/QueryFilter");
const Research = require("../../models/research");
const Events = require("../../models/events");
const Price = require("../../models/price");
const Investor = require("../../models/investorsAccount");
const EmailService = require("../../services/EmailService");
const CalendarService = require("../../services/CalendarService");
const { SCRAPPER_DB } = require("../../utils/config");
const { etfDataSchema } = require("../../models/etfData");
const { ObjectId } = mongoose.Types;
const Riskscore = require("../../models/riskscore");
const Users = require("../../models/users");
const eventSummary = require("../../models/eventSummary");
const xlsx = require("xlsx");

module.exports = {
  getstockbycategory: async (req, res) => {
    try {
      const eventId = req.params.id;
      const result = await Events.aggregate(
        [
          {
            $match: {
              _id: ObjectId(eventId),
            },
          },
          { $unwind: { path: "$subscriber" } },
          {
            $unwind: { path: "$subscriber.topgainers" },
          },
          {
            $group: {
              _id: {
                category: "$subscriber.topgainers.category",
                symbol: "$subscriber.topgainers.symbol",
              },
              value: {
                $first: "$subscriber.topgainers.value",
              },
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: "$_id.category",
              stocks: {
                $push: {
                  symbol: "$_id.symbol",
                  value: "$value",
                  occuranceincategory: "$count",
                },
              },
            },
          },
          { $unwind: { path: "$stocks" } },
          { $sort: { "stocks.occuranceincategory": -1 } },
          {
            $group: {
              _id: "$_id",
              stocks: {
                $push: {
                  symbol: "$stocks.symbol",
                  value: "$stocks.value",
                  occuranceincategory: "$stocks.occuranceincategory",
                },
              },
            },
          },
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      );

      res.apiResponse(true, "Stocks fetched", {
        result,
      });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  getEventSpecificAnalysis: async (req, res) => {
    try {
      const eventId = req.params.id;
      const { dict } = await Price.findOne({ data: 1 });
      const topPapers = await Research.find({
        event: ObjectId(eventId),
        isVerified: true,
        isFeatured: true,
      });

      // const totalPapers = await Research.countDocuments({
      //   event: ObjectId(eventId),
      //   isVerified: true,
      // });

      // const totalAnalysis = await Events.aggregate([
      //   {
      //     $match: {
      //       _id: ObjectId(eventId),
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       totalSubscribers: {
      //         $size: "$subscriber",
      //       },
      //     },
      //   },
      // ]);

      const topStocks = await Events.aggregate([
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
            impacts: {
              $push: "$subscriber.topgainers.impact",
            },
          },
        },
        {
          $sort: {
            value: -1,
          },
        },
        {
          $facet: {
            topStocks: [
              {
                $project: {
                  _id: 0,
                  symbol: "$_id",
                  value: 1,
                  average: {
                    $round: ["$average", 2],
                  },
                  maxImpact: {
                    $reduce: {
                      input: "$impacts",
                      initialValue: {
                        impact: "",
                        count: 0,
                      },
                      in: {
                        $let: {
                          vars: {
                            impactCount: {
                              $size: {
                                $filter: {
                                  input: "$impacts",
                                  as: "impact",
                                  cond: {
                                    $eq: ["$$impact", "$$this"],
                                  },
                                },
                              },
                            },
                          },
                          in: {
                            $cond: [
                              {
                                $gt: ["$$impactCount", "$$value.count"],
                              },
                              {
                                impact: "$$this",
                                count: "$$impactCount",
                              },
                              "$$value",
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
              {
                $limit: 10,
              },
            ],
            totalStocks: [
              {
                $count: "total",
              },
            ],
          },
        },
        {
          $unwind: "$totalStocks",
        },
        {
          $project: {
            topStocks: 1,
            totalStocks: "$totalStocks.total",
          },
        },
      ]);

      const [etfData] = await Events.aggregate([
        {
          $match: {
            _id: ObjectId(eventId),
          },
        },
        {
          $unwind: "$subscriber",
        },
        {
          $match: {
            "subscriber.etf": {
              $exists: true,
            },
          },
        },
        {
          $group: {
            _id: "$subscriber.etf",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $group: {
            _id: null,
            mostSelectedETF: {
              $first: "$_id",
            },
            leastSelectedETF: {
              $last: "$_id",
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);
      if (etfData) {
        const conn = mongoose.createConnection(SCRAPPER_DB);
        const etfDataModel = conn.model("etfDataScraper", etfDataSchema);
        etfData.mostSelectedETF = await etfDataModel.findOne({
          symbol: etfData.mostSelectedETF,
        });
        etfData.leastSelectedETF = await etfDataModel.findOne({
          symbol: etfData.leastSelectedETF,
        });
      }

      const updatedStocks = topStocks[0]?.topStocks.map((stock) => {
        return {
          ...stock,
          currentPrice: dict[stock?.symbol],
        };
      });

      const eventSummaryData = await eventSummary.findOne({ event: eventId });

      const event = await Events.findById(eventId).select({
        file: 1,
        stockFile: 1,
        sectorAnalysisFile: 1,
        futureStocks: 1,
        ria: 1,
      });

      res.apiResponse(true, "Event Analysis Done successfully", {
        topPapers,
        stockDetails: topStocks,
        updatedStocks,
        file: event?.file,
        stockFile: event?.stockFile,
        sectorAnalysisFile: event?.sectorAnalysisFile,
        ria: event?.ria,
        futureStocks: event?.futureStocks,
        totalStocks: eventSummaryData?.totalStocks,
        totalPapers: eventSummaryData?.totalPapers,
        totalAnalysis: eventSummaryData?.totalAnalysis,
        etfData,
      });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  getEventSpecificSummary: async (req, res) => {
    try {
      const eventId = req.params.id;

      const eventSummaryData = await eventSummary.findOne({ event: eventId });

      res.apiResponse(true, "Event Analysis Done successfully", {
        totalStocks: eventSummaryData?.totalStocks,
        totalPapers: eventSummaryData?.totalPapers,
        totalAnalysis: eventSummaryData?.totalAnalysis,
      });

      // const totalPapers = await Research.countDocuments({
      //   event: ObjectId(eventId),
      //   isVerified: true,
      // });

      // const totalAnalysis = await Events.aggregate([
      //   {
      //     $match: {
      //       _id: ObjectId(eventId),
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       totalSubscribers: {
      //         $size: "$subscriber",
      //       },
      //     },
      //   },
      // ]);

      // const totalStocks = await Events.aggregate([
      //   {
      //     $match: {
      //       _id: ObjectId(eventId),
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$subscriber",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$subscriber.topgainers",
      //       includeArrayIndex: "string",
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$subscriber.topgainers.symbol",
      //     },
      //   },
      //   {
      //     $count: "totalStocks",
      //   },
      // ]);

      // res.apiResponse(true, "Event Analysis Done successfully", {
      //   totalStocks: totalStocks[0]?.totalStocks,
      //   totalPapers,
      //   totalAnalysis: totalAnalysis[0]?.totalSubscribers,
      // });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  connectWithAnAdvisor: async (req, res) => {
    try {
      const {
        investorId,
        investorVAR,
        investorIdealRisk,
        requestedDate,
        fromTime,
        toTime,
        advisorEmail,
        advisorName,
      } = req.query;

      const { firstName, lastName, mobileNumber, email } =
        await Investor.findById(investorId);

      const { _id: advisorId } = await Users.findOne({
        email: advisorEmail,
      });

      const { questions, riskScores } = await Riskscore.findOne({
        userId: ObjectId(investorId),
      });
      // call the calendar servcice to generate the gmeet link and send the mails to the advisor and the investor
      const connectEventDetails = {
        scheduledDate: requestedDate,
        fromTime,
        toTime,
        investorVAR,
        investorIdealRisk,
        firstName,
        lastName,
        mobileNumber,
        email,
        questions,
        riskScores,
        advisorEmail,
        advisorName,
        investorId,
        advisorId,
      };

      const emailGroup = [
        {
          email,
        },
        {
          email: advisorEmail,
        },
      ];

      const createAndNotifyConnectEvent =
        CalendarService.generateGMeetLinkForAdvisors(
          connectEventDetails,
          emailGroup
        );

      res.apiResponse(
        true,
        "Your request has been sent to the advisor.",
        createAndNotifyConnectEvent
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  getStockImpact: async (req, res) => {
    try {
      const stockSymbol = req.query.symbol.toUpperCase();

      // Function to load data from an Excel file
      function loadData(filePath) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);
        return jsonData;
      }

      // Function to search for stock impact
      function searchStockImpact(data, stockSymbol) {
        const selectedStock = data.find(
          (stock) => stock["Stock Symbol"] === stockSymbol
        );
        if (!selectedStock) {
          return {
            stockInfo: null,
            errorMessage: `Stock symbol ${stockSymbol} not found.`,
          };
        } else {
          return { stockInfo: selectedStock, errorMessage: null };
        }
      }

      // Function to calculate stock price change
      function calculateStockPriceChange(stockInfo) {
        const changeInInflation = 0.01; // Assume a 1% change in inflation
        const correlationWithEvent = stockInfo["Correlation_with_event"];
        const latestClosePrice = stockInfo["Latest_Close_Price"];

        // Here we assume β as the correlation_with_event for simplicity
        const beta = correlationWithEvent;

        // Calculate the change in stock price
        const changeInStockPrice = beta * changeInInflation * latestClosePrice;

        return { changeInStockPrice, latestClosePrice };
      }

      // Load the data once when the server starts
      const filePath =
        "all_stock_parameters_with_metrics_and_interpretations.xlsx";
      const data = loadData(filePath);
      // Search for the stock and get the impact of inflation
      const { stockInfo, errorMessage } = searchStockImpact(data, stockSymbol);

      // Check if there was an error
      if (errorMessage) {
        console.log(errorMessage);
        return res.apiResponse(false, errorMessage, {});
      }

      const { changeInStockPrice, latestClosePrice } =
        calculateStockPriceChange(stockInfo);

      res.apiResponse(true, "Stock impact calculated successfully", {
        stockSymbol: stockInfo["Stock Symbol"],
        latestClosePrice: latestClosePrice,
        correlationWithInflation: stockInfo["Correlation_with_event"],
        changeInStockPriceIncrease: changeInStockPrice.toFixed(2),
        changeInStockPriceDecrease: (-changeInStockPrice).toFixed(2),
      });
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
