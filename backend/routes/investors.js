const router = require("express").Router();
const {
  getEtfs,
  getBonds,
  getCategorizedStocks,
} = require("../controlers/dataControler");
const { getETF } = require("../controlers/etfController");
const eventPortfolioController = require("../controlers/eventPortfolioController");
const {
  getEventStockInfo,
} = require("../controlers/eventStocksInfoController");
const {
  getIncomeStatementSummary,
  getIncomeStatementEvent,
} = require("../controlers/incomeStatementControler");
const {
  getInvestorsByParams,
} = require("../controlers/investor-controllers/investorFetch");
const {
  investorPaymentGateway,
  confirmInvestorPayment,
  confirmInvestorPaymentUsingToken,
  giveInvestorFreePremiumMembership,
  cancelInvestorFreePremiumMembership,
} = require("../controlers/investor-controllers/investorPayment");
const {
  completeProfileSteps,
} = require("../controlers/investor-controllers/investorProfileUpdate");
const {
  getStockRecommendation,
  getSectorRecommendation,
} = require("../controlers/investor-controllers/investorRecommendation");
const {
  gettotalInvestorRefers,
} = require("../controlers/investor-controllers/investorReferral");
const {
  register,
  updateDetails,
  checkReferCode,
} = require("../controlers/investor-controllers/investorRegister");
const mutualFundController = require("../controlers/mutualFundController");
const {
  createPortfolioLeaderBoard,
  getPortfolioLeaderBoard,
} = require("../controlers/portfolioLeaderBoard.controller");
const {
  createPortfolioManagementEvent,
  getPortfolioManagementEvent,
} = require("../controlers/portfolioManagementControler");
const { gettotalrefers } = require("../controlers/referralControler");
const {
  getresearchpaper,
  getFeaturedPapers,
  getPersonalizepapers,
  getRecommendedpapers,
} = require("../controlers/researchcontroler");
const {
  createriskscore,
  getriskscore,
  getriskscoreQustions,
} = require("../controlers/riskscoreControler");
const {
  getFundamentalData,
} = require("../controlers/scrapper-controllers/fundamentalDataController");
const {
  getLivePice,
} = require("../controlers/scrapper-controllers/livePriceController");
const {
  gettechnicalHourlyData,
} = require("../controlers/scrapper-controllers/technicalHourlyDataController");
const StrategyController = require("../controlers/strategy.controller");
const {
  getprice,
  fiidii,
  equitybulk,
  equityblock,
  getioip2,
  mutualfundreports,
  getioip1,
  getconsumervalue,
  getconsumerpriceindex,
  equityderivatives,
  optionanalyze,
  getPortfoliostock,
  savePortfoliostock,
  updatePortfolio,
  deletePortfoliostock,
  getUsers,
  getAdvisorySessions,
  saveBulkPortfolio,
  getZohoAdvisorySessions,
} = require("../controlers/usercontroler");
const zohoController = require("../controlers/zohoController");
const { investormiddleware } = require("../middlewares/investorAuthentication");
const zohoTokenValidate = require("../middlewares/zohoTokenValidate");

router.post("/create", register);
router.put("/update", updateDetails);
router.get("/get", getInvestorsByParams);

//Get Users
router.get("/getusers", getUsers);

//refercode
router.get("/check-refercode", checkReferCode);
router.get("/get-refer-count", investormiddleware, gettotalInvestorRefers);

// profile completion steps
router.put("/complete-profile", completeProfileSteps);

//Risk score
router.post("/riskscore/create", investormiddleware, createriskscore);
router.get("/riskscore/get", investormiddleware, getriskscore);
router.get("/riskscorequestions/get", investormiddleware, getriskscoreQustions);

// ETF
router.get("/getETF", investormiddleware, getETF);

// PRICE
router.get("/getprice", investormiddleware, getprice);

// research papers
router.get("/getresearchpaper", investormiddleware, getresearchpaper);
router.get(
  "/researchpaper/featured/get",
  investormiddleware,
  getFeaturedPapers
);
router.get(
  "/researchpaper/personalize/get",
  investormiddleware,
  getPersonalizepapers
);
router.get(
  "/researchpaper/recommended/get",
  investormiddleware,
  getRecommendedpapers
);

//Economic Activity
router.get(
  "/getcpi",
  investormiddleware,

  getconsumerpriceindex
);
router.get("/getgva", investormiddleware, getconsumervalue);
router.get("/getioip1", investormiddleware, getioip1);
router.get("/getioip2", investormiddleware, getioip2);

// Reports
router.get(
  "/mutualfundreports",
  investormiddleware,

  mutualfundreports
);
router.get("/equitybulk", investormiddleware, equitybulk);
router.get("/equityblock", investormiddleware, equityblock);
router.get("/equityderivatives", investormiddleware, equityderivatives);

// FII DII
router.get("/fiidii", investormiddleware, fiidii);

//OPEN ANALYZE
router.get("/optionanalyze", investormiddleware, optionanalyze);

//ADVISORY SESSIONS
router.get("/getAdvisorySessions", investormiddleware, getAdvisorySessions);
router.get(
  "/getzohoAdvisorySessions",
  investormiddleware,
  getZohoAdvisorySessions
);

router.get("/strategy", StrategyController.getStrategyStocks);

//PORTFOLIO
router.get("/getportfoliostock", investormiddleware, getPortfoliostock);
router.post("/saveportfoliostock", investormiddleware, savePortfoliostock);
router.put("/updatePortfoliostock", investormiddleware, updatePortfolio);
router.post("/saveBulkPortfolio", investormiddleware, saveBulkPortfolio);
router.put("/deletePortfoliostock", investormiddleware, deletePortfoliostock);

// payments
router.post("/paymentGateway", investormiddleware, investorPaymentGateway);
router.put("/paymentConfirm", investormiddleware, confirmInvestorPayment);
router.put(
  "/paymentConfirmByToken",
  investormiddleware,
  confirmInvestorPaymentUsingToken
);
router.put(
  "/freeMembership/give",
  investormiddleware,
  giveInvestorFreePremiumMembership
);
router.put(
  "/freeMembership/cancel",
  investormiddleware,
  cancelInvestorFreePremiumMembership
);

//recommendation
router.get("/recommendation/stock", getStockRecommendation);
router.get("/recommendation/sector", getSectorRecommendation);

//live price from scrapper
router.get("/live/price", investormiddleware, getLivePice);
//fundamental data from scrapper
router.get("/fundamentaldata", investormiddleware, getFundamentalData);
//technical hourly data
router.get("/technicaldata/horly", investormiddleware, gettechnicalHourlyData);

//income statement event summary
router.get(
  "/get/incomestatement/summary",
  investormiddleware,
  getIncomeStatementSummary
);
router.get(
  "/get/incomestatement/event",
  investormiddleware,
  getIncomeStatementEvent
);

//portfolio managment create
router.post(
  "/portfolio/management/create",
  investormiddleware,
  createPortfolioManagementEvent
);
router.get(
  "/portfolio/management",
  investormiddleware,
  getPortfolioManagementEvent
);
router.get(
  "/portfolio/management/:eventId",
  investormiddleware,
  getPortfolioManagementEvent
);

//event Portfolio
router.post(
  "/event/portfolio",
  investormiddleware,
  eventPortfolioController.createEventPortfolio
);
router.get(
  "/event/portfolio",
  investormiddleware,
  eventPortfolioController.getEventPortfolio
);

//mutual funds
router.get(
  "/mutualfund",
  investormiddleware,
  mutualFundController.getMutualFunds
);

router.use((err, req, res, next) => {
  console.log(err.message);
  res.apiResponse(false, err.message, err);
});

//zoho booking
router.get("/zoho/services", zohoTokenValidate, zohoController.fetchServices);
router.get("/zoho/staffs", zohoTokenValidate, zohoController.fetchStaff);
router.get(
  "/zoho/availableslots",
  zohoTokenValidate,
  zohoController.fetchAvailability
);
router.post(
  "/zoho/appointment/book",
  investormiddleware,
  zohoTokenValidate,
  zohoController.bookAppointment
);
router.get(
  "/zoho/appointment/get",
  zohoTokenValidate,
  zohoController.getAppointment
);
router.post(
  "/zoho/appointment/update",
  zohoTokenValidate,
  zohoController.updateAppointment
);
router.post(
  "/zoho/appointment/reschedule",
  zohoTokenValidate,
  zohoController.rescheduleAppointment
);

// portfolio leader board
router.post(
  "/portfolio-management/leaderboard",
  investormiddleware,
  createPortfolioLeaderBoard
);
router.get(
  "/portfolio-management/leaderboard",
  investormiddleware,
  getPortfolioLeaderBoard
);

// data

router.get("/data/etf", getEtfs);
router.get("/data/bonds", getBonds);
router.get("/data/categorized-stocks", getCategorizedStocks);

//stock info of event
router.get("/event-stocks", investormiddleware, getEventStockInfo);

module.exports = router;
