const bcrypt = require("bcrypt");
const Joi = require("joi");
const Users = require("../models/users");
const AdviceSessions = require("../models/adviceSession");
const AdvisorySessions = require("../models/advisorySessions");
const Events = require("../models/events");
const Otp = require("../models/otp");
const Research = require("../models/research");
const Price = require("../models/price");
const Portfolio = require("../models/portfolio");
const Cpimodel = require("../models/cpi");
const Gvamodel = require("../models/gva");
const Ioipmodel = require("../models/ioip");
const Profile = require("../models/profile");
const EmailGroup = require("../models/emailgroup");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let scrapper;
const options = {
  dbName: "scrapper",
};
scrapper = mongoose.createConnection(process.env.DB_URI, options);

// if (process.env.NODE_ENV == "production") {
//   scrapper = mongoose.createConnection(process.env.SCRAPPER_DB_URI);
// } else {
//   scrapper = mongoose.createConnection(
//     "mongodb://admin:admin@localhost:27017/scrapper?authSource=admin"
//   );
// }
const _ = require("lodash");
const { BlobServiceClient, BlockBlobClient } = require("@azure/storage-blob");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const path = require("path");
const QueryFilter = require("../utils/QueryFilter");
const compbyevent = require("../models/compbyevent");
const EmailService = require("../services/EmailService");

// const blobServiceClient = BlobServiceClient.fromConnectionString(
//   process.env.BLOB_CONNECTION_STRING
// );
const blobServiceClient = new BlobServiceClient(
  `https://${process.env.BLOB_ACCOUNT_NAME}.blob.core.windows.net/lol?${process.env.BLOB_SAS_TOKEN}`
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.CONTAINERNAME
);
module.exports = {
  register: async (req, res) => {
    try {
      const schema = {
        name: Joi.string().min(5).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(64).required(),
        phone: Joi.string().required(),
        otp: Joi.string().min(6).max(6).required(),
        refercode: Joi.string().allow("").optional(),
        phnotp: Joi.string().required(),
        secret_token: Joi.string().required(),
        role: Joi.string().required(),
      };

      const result = Joi.validate(req.body, schema);
      if (result.error)
        return res.status(400).send(result.error.details[0].message);
      const emailuser = await Users.findOne({ userid: req.body.email });
      if (emailuser) return res.apiResponse(false, "Email Already Registerd.");
      const phnuser = await Users.findOne({ phone: req.body.phone });
      if (phnuser)
        return res.apiResponse(false, "Phone Number Already Registerd.");
      const otp = await Otp.findOne({ email: req.body.email });
      if (!otp || otp.otp != req.body.otp)
        return res.status(400).send("Invalid Email Otp");
      const hash = await bcrypt.hash(req.body.password, 10);
      const payload = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        userid: req.body.email,
        password: hash,
        secret_token: req.body.secret_token,
        role: req.body.role,
      };
      let newUser;
      if (req.body.refercode) {
        const nameEmail = req.body.refercode.split("-");
        const referByEmail = nameEmail[nameEmail.length - 1];
        const user = await Users.findOne({ email: referByEmail });
        if (!user) return res.status(400).send("Invalid Refer code.");
        payload.referedby = user._id;
        newUser = await Users.create(payload);
      } else {
        newUser = await Users.create(payload);
      }
      const { _id, name, email } = newUser;
      const currentDate = new Date();
      await EmailGroup.findOneAndUpdate(
        {
          startdate: { $lte: currentDate },
          enddate: { $gte: currentDate },
        },
        { $push: { recipients: { userId: _id, name, email } } }
      );
      res.apiResponse(true, "Registration Successful", newUser);
      await Otp.findOneAndDelete({ email: req.body.email });
    } catch (err) {
      console.log(err);
      res.send({ success: false, message: "Registration Unsuccessful." });
    }
  },
  sendNotificationMail: async () => {
    let researchPaperlist = "";
    let eventslist = "";
    let html = "";
    const today = new Date();
    let prevdate = new Date().setDate(today.getDate() - 7);
    prevdate = new Date(prevdate);

    const researchPaper = await Research.find({
      createdAt: { $gte: prevdate, $lte: today },
    })
      .sort({ rate: -1 })
      .select("title subtitle")
      .limit(10);
    const events = await Events.find({
      startdate: { $gte: prevdate, $lte: today },
    }).select("name");
    researchPaper.forEach(
      (r) =>
        (researchPaperlist += `<li><a href="https://dev.predictram.com/viewresearch/${r._id}"><h3>${r.title}</h3></a></li>`)
    );
    events.forEach(
      (e) =>
        (eventslist += `<li><a href="https://dev.predictram.com/eventdetails/${e._id}"><h3>${e.name}</h3></a></li>`)
    );

    if (events.length === 0 && researchPaper.length === 0) {
      return;
    }
    if (researchPaper.length === 0) {
      html = `<h2 style="color:blue">This week's Events</h2><ol>${eventslist}</ol>`;
    } else if (events.length == 0) {
      html = `<h2 style="color:blue">This week's Research papers</h2><ol>${researchPaperlist}</ol>`;
    } else {
      html = `<h2 style="color:blue">This week's Research papers</h2><ol>${researchPaperlist}</ol><h2 style="color:blue">This week's Events</h2><ol>${eventslist}</ol>`;
    }
    const usersCount = await Users.find({}).count();
    const pageno = Math.trunc(usersCount / 50) + 1;
    let currentpage = 0;
    for (currentpage; currentpage < pageno; currentpage++) {
      const emails = await Users.find({}, { _id: 0, email: 1 })
        .skip(currentpage * 50)
        .limit(50);
      const reciverEmail = emails.map((obj) => obj.email);

      const sendingMail = await EmailService.sendCustomisedEmail(
        reciverEmail,
        "Predictram weekly notification for newly published Events and Research paper",
        html
      );
    }
  },

  getuser: async (req, res) => {
    try {
      res.send(
        _.pick(req.user, [
          "name",
          "email",
          "image",
          "admin",
          "active",
          "phone",
          "role",
          "id",
          "secret_token",
          "likedresearchpaper",
          "payments",
          "professional",
          "profilecomplete",
          "accessToRate",
          "creator",
          "isBetaUser",
          "accessToUser",
        ])
      );
    } catch (error) {
      console.log(error.message);
    }
  },

  updateUser: async (req, res) => {
    try {
      const { name, email, image, isBetaUser } = req.body;
      await Users.findByIdAndUpdate(req.user.id, {
        name,
        email,
        image,
        isBetaUser,
      });
      res.apiResponse(true, "profile updated");
    } catch (error) {
      res.apiResponse(false, "profile updated");
    }
  },

  getUserByMobileNumber: async (req, res) => {
    try {
      const phone = req.query.phone;
      const user = await Users.find({ phone: phone });
      if (!user) return res.apiResponse(false, "No account found", null);
      res.apiResponse(true, "Account found", user);
    } catch (error) {
      res.apiResponse(false, "cannot get user by mobile number");
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await Users.find(req.query);
      if (!users) return res.apiResponse(false, "Users not found", null);
      res.apiResponse(true, "Users found", users);
    } catch (error) {
      res.apiResponse(error.message);
    }
  },

  getAdvisorySessions: async (req, res) => {
    try {
      const sessions = await AdviceSessions.find(req.query)
        .populate("bookedBy", "firstName lastName")
        .populate("bookedFor", "name");
      if (!sessions) return res.apiResponse(false, "Session not found", null);
      res.apiResponse(true, "Sessions found", sessions);
    } catch (error) {
      res.apiResponse(error.message);
    }
  },

  getZohoAdvisorySessions: async (req, res) => {
    try {
      const sessions = await AdvisorySessions.find(req.query).populate(
        "investorId",
        "firstName lastName"
      );
      if (!sessions) return res.apiResponse(false, "Session not found", null);
      res.apiResponse(true, "Sessions found", sessions);
    } catch (error) {
      res.apiResponse(error.message);
    }
  },

  followtag: async (req, res) => {
    const maxTagLimitForUnpaidUser = 5;
    try {
      const isPremiumUser = await Users.findById(
        req.user.id,
        "payments"
      ).lean();

      const userProfile = await Profile.findById(req.user.id, "followedTags");

      // restrict user from following more than 5 tags if not premium
      if (
        !isPremiumUser.payments.premiumUser &&
        userProfile.followedTags.length === maxTagLimitForUnpaidUser
      ) {
        return res.status(402).send({ message: "Pay to follow more tags" });
      } else {
        await Profile.findByIdAndUpdate(req.user.id, {
          $push: { followedTags: req.body.tag },
        });
        res.send({ message: "Tag Followed Successfully" });
      }
    } catch (error) {
      console.log(error.message);
    }
  },
  unfollowtag: async (req, res) => {
    try {
      await Profile.findByIdAndUpdate(req.user.id, {
        $pull: { followedTags: req.body.tag },
      });
      res.send({ message: "Tag unfollowed successfully" });
    } catch (error) {
      console.log(error.message);
    }
  },
  postProfessional: async (req, res) => {
    try {
      await Users.findByIdAndUpdate(req.body.id, { professional: true })
        .then(() =>
          res.send({ message: "User given professional access successfully" })
        )
        .catch((err) => console.log(err));
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  giveCreatorAccess: async (req, res) => {
    try {
      const creatorAccess = await Users.findByIdAndUpdate(
        req.body.id,
        { creator: true },
        { new: true }
      );
      res.apiResponse(
        true,
        "User given creator access successfully",
        creatorAccess
      );
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },

  sendEmailOtp: async (req, res) => {
    try {
      const schema = {
        email: Joi.string().email().required(),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error)
        return res.status(400).send(result.error.details[0].message);
      let otp = generateOTP();
      await Otp.findOneAndUpdate(
        { email: req.body.email },
        { email: req.body.email, otp },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const sendingOTP = await EmailService.sendOTP(req.body.email, otp);
      res.apiResponse(true, "OTP sent successfully", sendingOTP);
    } catch {
      res.status(500).send();
    }
  },
  viewsubmittedevents: async (req, res) => {
    const uid = req.query.id || req.user.id;
    const events = await Events.find(
      { subscriber: { $elemMatch: { _id: uid } } },
      {
        forecastvalue: 1,
        name: 1,
        image: 1,
        enddate: 1,
        startdate: 1,
        lastvalue: 1,
        previousvalue: 1,
        "subscriber.$": 1,
      }
    )
      .sort({ enddate: -1 })
      .skip(req.body.count)
      .limit(50);
    // const events = await Events.aggregate()
    //   .match({ "subscriber._id": req.user.id })
    //   .project({
    //     forecastvalue: 1,
    //     name: 1,
    //     enddate: 1,
    //     lastvalue: 1,
    //     previousvalue: 1,
    //     subscriber: {
    //       $filter: {
    //         input: "$subscriber",
    //         as: "sub",
    //         cond: { $eq: ["$$sub._id", req.user._id] },
    //       },
    //     },
    //   })
    //   .sort({ enddate: -1 });
    res.send({ events });
  },
  forgetpassword: async (req, res) => {
    try {
      const schema = {
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(64).required(),
        otp: Joi.string().min(6).max(6).required(),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error)
        return res.status(400).send(result.error.details[0].message);
      const user = await Users.findOne({ userid: req.body.email });
      if (!user) return res.status(400).send("No account exists");
      const otp = await Otp.findOne({ email: req.body.email });
      if (otp && otp.otp == req.body.otp) {
        const newpassword = await bcrypt.hash(req.body.password, 10);
        await Users.findByIdAndUpdate(user._id, { password: newpassword });
        res.send("Password updated successfully");
      } else {
        res.status(400).send("Invalid Otp.");
      }
    } catch {
      res.status(500).send();
    }
  },

  test: async (req, res) => {
    try {
      ("61ee65c2423ea10b3be3d4bd");
      userid = "61ee6847de52b8b16f0a919d";
      rate = 1;
      let research = await Research.updateOne(
        {
          _id: mongoose.Types.ObjectId("62d2a658052e98505039d832"),
          "ratings.id": userid,
        },
        {
          $set: {
            "ratings.$.id": mongoose.Types.ObjectId(userid),
            "ratings.$.rate": rate,
          },
        }
      );
      if (!research.modifiedCount) {
        await Research.updateOne(
          {
            _id: mongoose.Types.ObjectId("62d2a658052e98505039d832"),
          },
          {
            $addToSet: {
              ratings: {
                id: mongoose.Types.ObjectId(userid),
                rate: rate,
              },
            },
          }
        );
      }

      res.send(research);
    } catch (error) {
      console.log(error.message);
    }
  },
  getprice: async (req, res) => {
    try {
      const { value } = await Price.findOne({ data: 1 });
      res.send(value);
    } catch (error) {
      console.log(error.message);
    }
  },
  getpricetoken: async (req, res) => {
    try {
      if (req.query.key == "HelloWorldPriceKey" && req.query.symbol == "ALL") {
        const { value } = await Price.findOne({});
        let temp = {};
        value.forEach((i) => (temp[i.symbol] = i.value));
        res.send(temp);
      } else {
        const { value } = await Price.findOne(
          { "value.symbol": req.query.symbol },
          "value.$"
        );
        res.send(value[0]);
      }
    } catch (error) {
      console.log(error.message);
    }
  },
  getPortfoliostock: async (req, res) => {
    try {
      const stocks = await Portfolio.find({
        ownerid: req.user?._id || req.query.id,
      });
      res.send(stocks);
    } catch (error) {
      console.log(error.message);
      res.status(500).send();
    }
  },
  savePortfoliostock: async (req, res) => {
    try {
      const {
        symbol,
        ownerid,
        companyName,
        varvalue,
        totalquantity,
        totalinvested,
        perstockprice,
      } = req.body;
      const stock = await Portfolio.findOne({
        symbol: symbol,
        ownerid: req.user?._id || req.body.id,
      });
      if (stock) {
        const newquantity = stock.totalquantity + totalquantity;
        const newtinvested = stock.totalinvested + totalinvested;
        const newpersp = newtinvested / newquantity;
        await Portfolio.findOneAndUpdate(
          { symbol: symbol, ownerid: req.user?._id || req.body.id },
          {
            totalquantity: newquantity,
            totalinvested: newtinvested,
            perstockprice: newpersp,
          }
        );
        return res.send({ msg: "stock updated" });
      } else {
        const newstock = new Portfolio(req.body);
        console.log(newstock);
        await newstock.save();
        res.send({ msg: "stock saved" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send();
    }
  },
  saveBulkPortfolio: async (req, res) => {
    try {
      const savedPortfolios = await Portfolio.create([...req.body]);
      res.apiResponse(true, "Stocks saved successfully", savedPortfolios);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  updatePortfolio: async (req, res) => {
    try {
      const { symbol, ownerid, totalquantity, totalinvested } = req.body;
      await Portfolio.findOneAndUpdate(
        { symbol: symbol, ownerid: req.user?._id || req.body.id },
        {
          totalquantity: totalquantity,
          totalinvested: totalinvested,
        }
      );
      res.send({ msg: "stock updated" });
    } catch (error) {
      console.log(error.message);
      res.status(500).send();
    }
  },
  deletePortfoliostock: async (req, res) => {
    try {
      const { symbol, ownerid, totalquantity, totalinvested } = req.body;
      await Portfolio.findOneAndDelete({
        symbol: symbol,
        ownerid: req.user?._id || req.body.id,
      });
      res.send({ msg: "stock deleted" });
    } catch (error) {
      console.log(error.message);
      res.status(500).send();
    }
  },

  getcompanydata: async (req, res) => {
    try {
      const key = req.query.key;
      if (key) {
        const companydata = new Schema(
          {
            ts: Date,
            peer_comparison: [],
            quarterly_results: [],
            profit_loss: [],
          },
          { collection: key, versionKey: false }
        );
        const k = scrapper.models[key] || scrapper.model(key, companydata);
        const data = await k.findOne({}).sort({ ts: -1 });
        res.send(data);
      }
    } catch (error) {
      console.log(error.message);
    }
  },
  getcomapnybyevent: async (req, res) => {
    try {
      const event = req.query.event;
      const data = await compbyevent.find({ event });
      res.send(data);
    } catch (error) {
      console.log(error.message);
    }
  },
  getconsumerpriceindex: async (req, res) => {
    try {
      const allcpi = await Cpimodel.find({});
      res.send(allcpi);
    } catch (error) {
      console.log(error.message);
    }
  },
  getconsumervalue: async (req, res) => {
    try {
      const allgva = await Gvamodel.find({});
      res.send(allgva);
    } catch (error) {
      console.log(error.message);
    }
  },
  getioip1: async (req, res) => {
    try {
      const ioip1 = await Ioipmodel.find({ type: 1 });
      res.send(ioip1);
    } catch (error) {
      console.log(error.message);
    }
  },
  getioip2: async (req, res) => {
    try {
      const ioip2 = await Ioipmodel.find({ type: 2 });
      res.send(ioip2);
    } catch (error) {
      console.log(error.message);
    }
  },
  mutualfundreports: async (req, res) => {
    const mutualfund = new Schema(
      { Exchange: String },
      { collection: "mutualfund", versionKey: false }
    );
    const Mutualfund =
      scrapper.models["mutualfund"] || scrapper.model("mutualfund", mutualfund);
    const data = await Mutualfund.find({}).select("-_id");
    res.send(data);
  },
  equityblock: async (req, res) => {
    const equityblock = new Schema(
      { Exchange: String },
      { collection: "equityblock", versionKey: false }
    );
    const Equityblock =
      scrapper.models["equityblock"] ||
      scrapper.model("equityblock", equityblock);
    const data = await Equityblock.find({}).select("-_id");
    res.send(data);
  },
  equitybulk: async (req, res) => {
    const equitybulk = new Schema(
      { Exchange: String },
      { collection: "equitybulk", versionKey: false }
    );
    const Equitybulk =
      scrapper.models["equitybulk"] || scrapper.model("equitybulk", equitybulk);
    const data = await Equitybulk.find({}).select("-_id");
    res.send(data);
  },
  equityderivatives: async (req, res) => {
    const equityderivatives = new Schema(
      {},
      { collection: "equityderivatives", versionKey: false }
    );
    const Equityderivatives =
      scrapper.models["equityderivatives"] ||
      scrapper.model("equityderivatives", equityderivatives);
    const data = await Equityderivatives.find({}).select("-_id");
    res.send(data);
  },
  fiidii: async (req, res) => {
    const fiidii = new Schema({}, { collection: "fii_dii", versionKey: false });
    const Fiidii =
      scrapper.models["fii_dii"] || scrapper.model("fii_dii", fiidii);
    const data = await Fiidii.find({}).select("-_id");
    res.send(data);
  },
  optionanalyze: async (req, res) => {
    const companydata = new Schema(
      { data: String },
      { collection: "analyzer", versionKey: false }
    );
    const k =
      scrapper.models["analyzer"] || scrapper.model("analyzer", companydata);
    const data = await k.findOne({ data: req.query.indices });
    res.send(data);
  },
};
function generateOTP() {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
