const StrategyService = require("../services/strategy.service");

class StrategyController {
  static async getStrategyStocks(req, res) {
    const { eventId, strategy, stockSymbol } = req.query;

    const { success, message, data } = await StrategyService.getStrategyStocks({
      eventId,
      strategy,
      stockSymbol,
    });
    res.apiResponse(success, message, data);
  }
}

module.exports = StrategyController;
