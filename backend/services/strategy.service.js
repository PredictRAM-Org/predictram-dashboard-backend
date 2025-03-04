const EventModel = require("../models/events");
const StrategyHelper = require("../helpers/strategy.helper");

class StrategyService {
  static async getStrategyStocks({
    eventId = "",
    strategy = "",
    stockSymbol = "",
  }) {
    try {
      const event = await EventModel.findById(eventId);

      if (!event) {
        return {
          success: false,
          message: "Event not found",
          data: null,
        };
      }

      const jsonData = await StrategyHelper.convertExcelToJson(event.stockFile);
      const strategies = StrategyHelper.getStrategies();

      let data;

      if (stockSymbol) {
        data = StrategyHelper.filterStocksBySymbol(jsonData, stockSymbol);
      } else if (strategies[strategy]) {
        data = StrategyHelper.filterStocksByStrategy(
          jsonData,
          strategies[strategy]
        );
      } else {
        data = {
          filteredStocks: [],
          description: "Strategy not found",
          benefit: "",
          disadvantage: "",
        };
      }

      return {
        success: true,
        message: "successfully fetched strategy stocks",
        data,
      };
    } catch (err) {
      return {
        success: false,
        message: "Error fetching strategy stocks",
        data: err.message,
      };
    }
  }
}

module.exports = StrategyService;
