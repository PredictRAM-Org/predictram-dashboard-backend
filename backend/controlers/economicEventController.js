const EventPortfolio = require("../models/eventPortfolio");
const { ObjectId } = require("mongoose").Types;
const mutualFund = require("../models/mutualFund");
const { fyersQuotesService } = require("./broker/fyersControler");
const path = require("path");
const fs = require("fs/promises");

module.exports = {
  getEconomicEventStock: async (req, res) => {
    try {
      const { stock_symbols, event_type } = req.query;

      if (!stock_symbols || !event_type) {
        return res.status(400).json({ error: "stock_symbols and event_type are required" });
      }

      // Resolve the path to the appropriate JSON file
      const filePath = path.resolve(
        __dirname,
        "../utils/data/economicEventAnalysisData",
        `${event_type}.json`
      );

      // Read the JSON file
      const fileContent = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(fileContent); // Parse JSON content

      // Filter the stock data for matching symbols
      const stockDataArray = stock_symbols
        .map((symbol) => data.find((item) => item["Symbol"] === symbol))
        .filter(Boolean); // Remove undefined entries

      res.apiResponse(true, "economic event stock fetched", stockDataArray.length > 0 ? stockDataArray : null);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  getEconomicEventUpcomingRate: async (req, res) => {
    try {
      const { event_type } = req.query;

      if (!event_type) {
        return res.status(400).json({ error: "event_type are required" });
      }

      // Resolve the path to the appropriate JSON file
      const filePath = path.resolve(
        __dirname,
        "../utils/data/economicEventAnalysisData",
        `${event_type}.json`
      );

      // Read the JSON file
      const fileContent = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(fileContent); // Parse JSON content

      console.log(data[0]);      

      // Filter the stock data for matching symbols
      const upcomingRate = data[0]["Latest Event Value"];

      res.apiResponse(true, "economic event stock fetched", upcomingRate ? upcomingRate : null);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
};
