const router = require("express").Router();
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
  createEvent,
  updateEvent,
  getevent,
  getEvents,
  deleteEvent,
  getusers,
  deploycontract,
  addcomapnybyevent,
  editcomapnybyevent,
  getRegisteredUsers,
  getRegisteredInvestors,
  deletecomapnybyevent,
  test,
  publishResearchPaper,
} = require("../controlers/admincontroler");
const { ratepost } = require("../controlers/research/index");
const admincontroler = require("../controlers/admincontroler");
const { makePaperFeatured } = require("../controlers/researchcontroler");
const {
  createEmailGroup,
  getEmailGroup,
  deleteEmailGroup,
  sendIndividualEmail,
  sendGroupEmail,
} = require("../controlers/emailControler");

const { adminmiddleware } = require("../middlewares/userAuthentication");
const {
  assignSessionOnSpecificDate,
} = require("../controlers/creator/sessionControler");
const { giveCreatorAccess } = require("../controlers/usercontroler");
const {
  createPortfolioManagementEvent,
} = require("../controlers/portfolioManagementControler");
const {
  createIncomeStatementEvent,
} = require("../controlers/incomeStatementControler");
const {
  internApproval,
  internRejection,
} = require("../controlers/internSelectionControler");
const {
  getEventSubscriberReport,
  getEventPortfolioReport,
} = require("../controlers/report.controler");
const {
  createEventStockInfo,
  updateEventStockInfo,
  getEventStockInfo,
  deleteEventStockInfo,
} = require("../controlers/eventStocksInfoController");
const { getBondQnA } = require("../controlers/bondQnAControler");
const { getPaymentDetails } = require("../controlers/paymentcontroler");

router.get("/getusers", getusers);
router.get("/get/registered/users", getRegisteredUsers);
router.get("/get/registered/investors", getRegisteredInvestors);
router.put("/researchpaper/featured/create", makePaperFeatured);
// router.post("/deploycontract", deploycontract);
router.post("/createevent", upload.single("image"), createEvent);
router.put("/updateevent/:id", updateEvent);
router.post("/getevent", getevent);
router.get("/getevents", getEvents);
router.post("/deleteevent", deleteEvent);
router.post("/getprice", deleteEvent);
router.post("/ratepost", ratepost);
router.post("/addcomapnybyevent", addcomapnybyevent);
router.put("/publishpaper", publishResearchPaper);
router.delete(
  "/deletecomapnybyevent/:id",

  deletecomapnybyevent
);
router.put("/editcomapnybyevent/:id", editcomapnybyevent);
router.post("/test", test);
//emailGroup
router.post("/email-group/create", createEmailGroup);
router.get("/email-group/get", getEmailGroup);
router.delete("/email-group/delete/:id", deleteEmailGroup);
router.post("/email-group/sendIndividualEmail", sendIndividualEmail);
router.post("/email-group/sendGroupEmail", sendGroupEmail);

// intern selection
router.post("/intern/approval", internApproval);
router.post("/intern/rejection", internRejection);

// creator access
router.post("/access/creator", giveCreatorAccess);

// sessions
router.put("/sessions/assign", assignSessionOnSpecificDate);

// portfolio events
router.post("/portfolio/management/create", createPortfolioManagementEvent);

//create income statement
router.post("/create/incomestatement/event", createIncomeStatementEvent);

// reports
router.get("/report/event/subscribers", getEventSubscriberReport);
router.get("/report/event/portfolio", getEventPortfolioReport);

//stock info of event
router.get("/event-stocks", getEventStockInfo);
router.post("/event-stocks", createEventStockInfo);
router.put("/event-stocks/:id", updateEventStockInfo);
router.delete("/event-stocks", deleteEventStockInfo);

// bond question and answer
router.get("/bond-qna", getBondQnA);

// bond question and answer
router.get("/payment-details", getPaymentDetails);

module.exports = router;
