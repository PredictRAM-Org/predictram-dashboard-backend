const router = require("express").Router();
const {
  register,
  getuser,
  followtag,
  unfollowtag,
  getprice,
  getpricetoken,
  getPortfoliostock,
  savePortfoliostock,
  updatePortfolio,
  deletePortfoliostock,
  viewsubmittedevents,
  forgetpassword,
  sendEmailOtp,
  test,
  getcompanydata,
  getcomapnybyevent,
  mutualfundreports,
  equityblock,
  equitybulk,
  equityderivatives,
  optionanalyze,
  fiidii,
  getconsumerpriceindex,
  getconsumervalue,
  getioip1,
  getioip2,
  postProfessional,
  getUserByMobileNumber,
  updateUser,
  saveBulkPortfolio,
} = require("../controlers/usercontroler");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },
  filename(req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${uuidv4()}.${ext}`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = file.mimetype.split("/")[1];
    if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
      return callback(
        new Error("Not an image! Please upload an image."),
        false
      );
    } else {
      callback(null, true);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

const {
  paymentGateway,
  confirmPayment,
  confirmPaymentUsingToken,
  giveFreePremiumMembership,
  cancelFreePremiumMembership,
} = require("../controlers/paymentcontroler");
const {
  getprofile,
  saveprofile,
} = require("../controlers/profile/profilecControler");
const {
  saveExperience,
  updateExperience,
  deleteExperience,
} = require("../controlers/profile/experienceControler");
const {
  leaderboard,
  // leaderboardByLikes,
  customLeaderBoard,
  leaderboardByDate,
} = require("../controlers/leaderboardControler");
const {
  getEvents,
  getTaggedEvents,
  getEvent,
  saveEvent,
  purchaseEvent,
  getEventPrice,
  getCurrentEvents,
  getEventChartData,
} = require("../controlers/eventControler");
const {
  createETF,
  getETF,
  deleteETF,
  getEtfCurrentPrice,
} = require("../controlers/etfController");
const {
  createPortfolioScore,
  getPortfolioScore,
} = require("../controlers/portfolioScoreControler");
const {
  getresearchpaper,
  yourresearchpaper,
  likeresearchpaper,
  postresearchpaper,
  updateresearchpaper,
  gettagresearchpapers,
  deletePost,
  getFeaturedPapers,
  getPersonalizepapers,
  getRecommendedpapers,
  getPointByLinkedinShareLink,
  getResearchPaperId,
} = require("../controlers/researchcontroler");
const {
  createriskscore,
  getriskscore,
  getriskscoreQustions,
} = require("../controlers/riskscoreControler");
const { gettotalrefers } = require("../controlers/referralControler");
const {
  fyerslogin,
  fyersprofile,
  fyersHoldings,
  fyersPosition,
  fyersPlaceMultiOrder,
  fyersFunds,
  fyersAuth,
  fyersQuotes,
} = require("../controlers/broker/fyersControler");
const {
  usermiddleware,
  premiumUserMiddleware,
  adminmiddleware,
  creatorMiddleware,
} = require("../middlewares/userAuthentication");
const {
  createSession,
  getSession,
  getUnAssignedSession,
  updateSession,
  deleteSession,
  getAvailableSessions,
  registerForSession,
  getUserRegisterSessions,
  scheduleSession,
} = require("../controlers/creator/sessionControler");
const {
  getPortfolioManagementEvent,
  submitPortfolioManagementEvent,
  getUserPortfolioManagement,
} = require("../controlers/portfolioManagementControler");
const {
  createPortfolioReport,
  getPortfolioReport,
  deletePortfolioReport,
} = require("../controlers/portfolioManagementReportControler");
const {
  getAllSector,
  getSectorRatio,
} = require("../controlers/sectorRatioControler");
const {
  createIncomeStatementEvent,
  subscribeToIncomeStatementEvent,
  getIncomeStatementEvent,
  getIncomeStatementSummary,
  getIncomeStatementHistory,
} = require("../controlers/incomeStatementControler");
const {
  getLivePice,
} = require("../controlers/scrapper-controllers/livePriceController");
const {
  getFundamentalData,
} = require("../controlers/scrapper-controllers/fundamentalDataController");
const {
  gettechnicalHourlyData,
} = require("../controlers/scrapper-controllers/technicalHourlyDataController");
const {
  getEtfData,
} = require("../controlers/scrapper-controllers/etfDataController");
const {
  paytmMoneyLogin,
  paytmMoneyProfile,
  paytmMoneyHoldings,
  paytmMoneyLivePrice,
} = require("../controlers/broker/paytmMoneyControler");
const {
  getRatioAnalyserResult,
} = require("../controlers/ratio_analyser/ratioAnalyserControler");
const {
  getAttemptTracker,
  createAttemptTracker,
  updateAttemptTracker,
  restoreAttempts,
} = require("../controlers/attemptTracker.controller");
const {
  getPortfolioLeaderBoard,
} = require("../controlers/portfolioLeaderBoard.controller");
const { createBondQnA } = require("../controlers/bondQnAControler");
const StrategyController = require("../controlers/strategy.controller");
const { getEconomicEventStock, getEconomicEventUpcomingRate } = require("../controlers/economicEventController");

router.post("/register", register);
router.post("/forgetpassword", forgetpassword);
router.post("/sendEmailOtp", sendEmailOtp);
router.put("/updateuser", usermiddleware, updateUser);

// research papers
router.get("/getresearchpaper", getresearchpaper);
router.get("/getresearchpaperid", getResearchPaperId);
router.get("/researchpaper/featured/get", getFeaturedPapers);
router.get(
  "/researchpaper/personalize/get",

  getPersonalizepapers
);
router.get(
  "/researchpaper/recommended/get",

  getRecommendedpapers
);
router.get("/yourresearchpaper", usermiddleware, yourresearchpaper);
router.post("/likeresearchpapaer", usermiddleware, likeresearchpaper);
router.post(
  "/postresearchpaper",
  usermiddleware,
  upload.single("image"),
  postresearchpaper
);
router.put("/updateresearchpaper", usermiddleware, updateresearchpaper);
router.post("/gettagedresearch", usermiddleware, gettagresearchpapers);
router.post("/deletepost", usermiddleware, deletePost);
router.post(
  "/getpointbylinkedinsharelink",
  usermiddleware,
  getPointByLinkedinShareLink
);

router.get(
  "/optionanalyze",
  usermiddleware,
  premiumUserMiddleware,
  optionanalyze
);
router.get("/getuser", usermiddleware, getuser);
router.get("/getuserByPhone", getUserByMobileNumber);

// Profile
router.get("/getprofile/", usermiddleware, getprofile);
router.post("/saveprofile", saveprofile);

// Experience
router.post("/saveexperiance", usermiddleware, saveExperience);
router.put("/updateexperiance", usermiddleware, updateExperience);
router.post("/deleteexperiance", usermiddleware, deleteExperience);

//Risk score
router.post("/riskscore/create", usermiddleware, createriskscore);
router.get("/riskscore/get", usermiddleware, getriskscore);
router.get("/riskscorequestions/get", usermiddleware, getriskscoreQustions);

//Referral
router.get("/referrals/count/get", usermiddleware, gettotalrefers);

router.post("/followtag", usermiddleware, followtag);
router.post("/unfollowtag", usermiddleware, unfollowtag);
router.get("/getevents", usermiddleware, getEvents);
router.get("/getevent/chartdata", getEventChartData);
router.get("/getcurrentevents", usermiddleware, getCurrentEvents);
router.post("/gettagedevents", usermiddleware, getTaggedEvents);
router.get("/viewsubmittedevents", viewsubmittedevents);
router.post("/getevent", usermiddleware, getEvent);
router.post("/saveevent", usermiddleware, saveEvent);
router.post("/purchaseevent", usermiddleware, purchaseEvent);
router.get("/getprice", usermiddleware, getprice);
router.get("/getportfoliostock", usermiddleware, getPortfoliostock);
router.post("/saveportfoliostock", usermiddleware, savePortfoliostock);
router.put("/updatePortfoliostock", usermiddleware, updatePortfolio);
router.put("/deletePortfoliostock", usermiddleware, deletePortfoliostock);
router.get("/geteventprice", usermiddleware, getEventPrice);
router.get("/getpricetoken", usermiddleware, getpricetoken);
router.get("/getcompanydata", usermiddleware, getcompanydata);
router.get(
  "/getcpi",
  usermiddleware,
  premiumUserMiddleware,
  getconsumerpriceindex
);
router.get("/getgva", usermiddleware, premiumUserMiddleware, getconsumervalue);
router.get("/getioip1", usermiddleware, premiumUserMiddleware, getioip1);
router.get("/getioip2", usermiddleware, premiumUserMiddleware, getioip2);
router.get(
  "/mutualfundreports",
  usermiddleware,
  premiumUserMiddleware,
  mutualfundreports
);

router.get("/equitybulk", usermiddleware, equitybulk);
router.get("/equityblock", usermiddleware, equityblock);
router.get(
  "/equityderivatives",
  usermiddleware,
  premiumUserMiddleware,
  equityderivatives
);
router.get("/fiidii", usermiddleware, fiidii);

// leaderboard
router.get("/leaderboard", usermiddleware, leaderboard);
router.get("/leaderboard/castom", usermiddleware, customLeaderBoard);
router.get("/leaderboard/bydate", usermiddleware, leaderboardByDate);
// router.get("/leaderboard/bylikes", usermiddleware, leaderboardByLikes);

// payments
router.post("/paymentGateway", usermiddleware, paymentGateway);
router.put("/paymentConfirm", usermiddleware, confirmPayment);
router.put("/paymentConfirmByToken", usermiddleware, confirmPaymentUsingToken);
router.put("/freeMembership/give", usermiddleware, giveFreePremiumMembership);
router.put(
  "/freeMembership/cancel",
  usermiddleware,
  cancelFreePremiumMembership
);

// professional user
router.post("/professionalUser", usermiddleware, postProfessional);

// etf
router.post("/createETF", adminmiddleware, createETF);
router.get("/getETF", usermiddleware, getETF);
router.get("/getEtfCurrentPrice", usermiddleware, getEtfCurrentPrice);
router.delete("/deleteETF/:id", adminmiddleware, deleteETF);

//getcomapnybyevent
router.get("/getcomapnybyevent", usermiddleware, getcomapnybyevent);

// portfolioscore
router.post("/portfolioScore/create", adminmiddleware, createPortfolioScore);
router.get("/portfolioScore/get", usermiddleware, getPortfolioScore);

//fyers
router.get("/fyers/login", fyersAuth);
router.get("/fyers/getProfile", fyersprofile);
router.get("/fyers/getHoldings", fyersHoldings);
router.get("/fyers/getPosition", fyersPosition);
router.post("/fyers/placeMultiOrder", fyersPlaceMultiOrder);
router.get("/fyers/getFunds", fyersFunds);
router.get("/fyers/quotes", fyersQuotes);

//paytmMoney
router.post("/paytmMoney/login", paytmMoneyLogin);
router.get("/paytmMoney/getProfile", paytmMoneyProfile);
router.get("/paytmMoney/getHoldings", paytmMoneyHoldings);
router.get("/paytmMoney/livePrice", paytmMoneyLivePrice);
// router.get("/fyers/getPosition", fyersPosition);
// router.post("/fyers/placeMultiOrder", fyersPlaceMultiOrder);
// router.get("/fyers/getFunds", fyersFunds);

//sessions
router.post(
  "/sessions/create",
  usermiddleware,
  creatorMiddleware,
  createSession
);
router.get("/sessions/get", usermiddleware, getSession);
router.get("/sessions/get/unassigned", usermiddleware, getUnAssignedSession);
router.put(
  "/sessions/update/:id",
  usermiddleware,
  creatorMiddleware,
  updateSession
);
router.delete(
  "/sessions/delete/:id",
  usermiddleware,
  creatorMiddleware,
  deleteSession
);
router.get("/sessions/get/available", usermiddleware, getAvailableSessions);
router.post("/sessions/create/register", usermiddleware, registerForSession);
router.get(
  "/sessions/registered/:userId",
  usermiddleware,
  getUserRegisterSessions
);

router.get("/sessions/notify-users", scheduleSession);

// portfolio management
router.get("/portfolio/management", getPortfolioManagementEvent);

// portfolio management
router.put("/portfolio/management/submit", submitPortfolioManagementEvent);
router.get("/portfolio/management/user-portfolio", getUserPortfolioManagement);
router.get("/portfolio/management/:eventId", getPortfolioManagementEvent);
router.post("/portfolio/management/report/create", createPortfolioReport);
router.get("/portfolio/management/report/get", getPortfolioReport);
router.delete("/portfolio/management/report/delete", deletePortfolioReport);

//sector ratio
router.get("/sector/all", usermiddleware, getAllSector);
router.get("/sector/ratio/get", usermiddleware, getSectorRatio);

//income statement event
router.put(
  "/subscribe/incomestatement/event/:eventId",
  usermiddleware,
  subscribeToIncomeStatementEvent
);
router.get(
  "/get/incomestatement/event",
  usermiddleware,
  getIncomeStatementEvent
);
router.get(
  "/get/incomestatement/summary",
  usermiddleware,
  getIncomeStatementSummary
);
router.get(
  "/get/incomestatementhistory",
  usermiddleware,
  getIncomeStatementHistory
);

//scrapper
router.get("/live/price", usermiddleware, getLivePice);
router.get("/fundamentaldata", usermiddleware, getFundamentalData);
router.get("/technicaldata/horly", usermiddleware, gettechnicalHourlyData);
router.get("/etfdata", usermiddleware, getEtfData);

//Economic event
router.get("/economic-event-stock", getEconomicEventStock);
router.get("/economic-event-upcoming-rate", getEconomicEventUpcomingRate);

// Attempt Tracker
router.get("/attempt-tracker/:userId", getAttemptTracker);
router.post("/attempt-tracker", createAttemptTracker);
router.put("/attempt-tracker/:userId", updateAttemptTracker);
router.put("/attempt-tracker/restore/:userId", restoreAttempts);

//rato analyser
router.get("/ratio-analyser", getRatioAnalyserResult);

// portfolio leader board
router.get(
  "/portfolio-management/leaderboard",
  usermiddleware,
  getPortfolioLeaderBoard
);

// bond question and answer
router.post("/bond-qna", createBondQnA);

router.get("/test", test);
router.use((err, req, res, next) => {
  console.log(err.message);
  res.status(400).json({
    msg: err.message,
  });
});
module.exports = router;
