const router = require("express").Router();

const {
  getEventSpecificAnalysis,
  connectWithAnAdvisor,
  getEventSpecificSummary,
  getstockbycategory,
  getStockImpact,
} = require("../../controlers/investor-controllers/eventAnalysisController");
const {
  getAllInvestorEvent,
  getSpecificInvestorEvent,
  createInvestorEvent,
  sendPushNotification,
  saveFcmToken,
} = require("../../controlers/investor-controllers/investorEventController");

const {
  investormiddleware,
} = require("../../middlewares/investorAuthentication");

router.get("/getstockbycategory/:id", investormiddleware, getstockbycategory);

router.get("/get", investormiddleware, getAllInvestorEvent);
router.get("/get/:id", investormiddleware, getSpecificInvestorEvent);
router.post("/create", createInvestorEvent);
router.put("/save/token", saveFcmToken);
router.post("/push", sendPushNotification);

router.get("/connect", connectWithAnAdvisor);

router.get("/analysis/:id", getEventSpecificAnalysis);
router.get("/stock-impact", getStockImpact);

router.get(
  "/analysis/summary/:id",
  // investormiddleware,
  getEventSpecificSummary
);

module.exports = router;
