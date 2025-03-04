const etfData = require("../utils/data/ETFData.json");
const bondData = require("../utils/data/BondData.json");
const categorizedStocksData = require("../utils/data/categorizedStocksData.json");

module.exports = class DataService {
  static getEtfs(category) {
    if (!category) return etfData;
    const data = etfData.filter((d) => d.Category === category);
    return data;
  }

  static getBonds(category) {
    if (!category) return bondData;
    const data = bondData.filter((d) => d.Category === category);
    return data;
  }

  static getCategorizedStocks(category) {
    const uniqueCategorizedStocks = [...new Set(categorizedStocksData)];
    if (!category) return uniqueCategorizedStocks;
    const data = uniqueCategorizedStocks.filter((d) => d.Category === category);
    return data;
  }
};
