const { generateRefreshToken } = require("../services/ZohoService");
const nodeCache = require("../utils/nodeCache");

module.exports = async (req, res, next) => {
  const token = nodeCache.get("zohoToken");
  if (!token) await generateRefreshToken();
  next();
};
