const mongoose = require("mongoose");
const Profile = require("../models/profile");
const Research = require("../models/research");
const Users = require("../models/users");
const QueryFilter = require("../utils/QueryFilter");
const puppeteer = require("puppeteer");

module.exports = {
  yourresearchpaper: async (req, res) => {
    try {
      const queryFilter = new QueryFilter([
        "isVerified",
        "startdate",
        "enddate",
        "event",
      ]);
      const filteredParams = queryFilter.filter(req.query);
      const uid = req.query.id || req.user.id;
      const query = {};
      if (!!filteredParams?.isVerified) {
        query.isVerified = filteredParams.isVerified;
      }
      if (!!filteredParams?.startdate) {
        query.createdAt = { $gte: new Date(filteredParams.startdate) };
      }
      if (!!filteredParams?.enddate) {
        query.createdAt = { $lte: new Date(filteredParams.enddate) };
      }
      if (!!filteredParams?.event) {
        query.event = filteredParams.event;
      }

      const data = await Research.find(
        { userId: uid, ...query },
        { data: 0 }
      ).sort({ updatedAt: -1 });

      res.send(data);
    } catch {
      res.status(400).send();
    }
  },

  getRecommendedpapers: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["tags", "userId", "postId"]);
      const filteredParams = queryFilter.filter(req.query);
      const { userId, tags, postId } = filteredParams;
      const data = await Research.find({
        userId,
        isVerified: true,
        _id: { $ne: postId },
        tags: { $in: tags },
      })
        .sort({ updatedAt: -1, rate: -1 })
        .skip(req.query.count)
        .limit(3);

      res.send(data);
    } catch {
      res.status(400).send();
    }
  },

  getResearchPaperId: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["userId", "event"]);
      const allowedParams = queryFilter.filter(req.query);
      const data = await Research.find(allowedParams);

      res.apiResponse(true, "Paper fetched successfully", { id: data[0]?._id });
    } catch (error) {
      res.apiResponse(false, error?.message, error);
    }
  },

  getresearchpaper: async (req, res) => {
    try {
      if (req.query.id) {
        const data = await Research.findById(
          mongoose.Types.ObjectId(req.query.id)
        )
          .sort({ updatedAt: -1 })
          // .select("updatedAt createdAt")
          .populate([
            { path: "userId", select: "name" },
            { path: "likes", select: "name" },
            { path: "event", select: "name" },
          ]);
        res.send(data);
      } else {
        const queryFilter = new QueryFilter(["rate", "isVerified", "userId"]);
        const allowedParams = queryFilter.filter(req.query);
        const pageno = req.query.count >= 1 ? req.query.count - 1 : 0;
        const data = await Research.find(allowedParams)
          .sort({ createdAt: -1 })
          .select(
            "id title subtitle likes image text updatedAt createdAt rate isFeatured data"
          )
          .populate([{ path: "userId", select: "name" }])
          .skip(pageno * 20)
          .limit(20)
          .allowDiskUse(true);
        const totalPaper = await Research.countDocuments({ isVerified: true });
        const totalNonRatedPaper = await Research.countDocuments({ rate: 0 });
        res.send({ data, totalPaper, totalNonRatedPaper });
      }
    } catch (error) {
      console.log(error.message);
      res.status(404).send();
    }
  },

  getPersonalizepapers: async (req, res) => {
    const queryFilter = new QueryFilter(["rate", "isVerified"]);
    const allowedParams = queryFilter.filter(req.query);
    const pageno = req.query.count >= 1 ? req.query.count - 1 : 0;
    const profile = await Profile.findById(req.user.id, {
      followedTags: 1,
      _id: 0,
    });
    const data = await Research.find({
      ...allowedParams,
      tags: { $in: profile.followedTags },
    })
      .sort({ createdAt: -1 })
      .select(
        "id title subtitle likes image text updatedAt createdAt rate isFeatured"
      )
      .populate([{ path: "userId", select: "name" }])
      .skip(pageno * 20)
      .limit(20)
      .allowDiskUse(true);
    const totalPaper = await Research.countDocuments({
      ...allowedParams,
      tags: { $in: profile.followedTags },
    });
    return res.send({ data, totalPaper });
  },

  gettagresearchpapers: async (req, res) => {
    try {
      const data = await Research.find({ tags: { $eq: req.body.tag } })
        .sort({ updatedAt: -1 })
        .select(
          "id title subtitle likes image text updatedAt createdAt isFeatured"
        )
        .populate([{ path: "userId", select: "name" }])
        .skip(req.body.count)
        .limit(20);
      res.send(data);
    } catch (error) {
      console.log(error.message);
    }
  },
  likeresearchpaper: async (req, res) => {
    try {
      const research = await Research.findOne({
        "likes.id": mongoose.Types.ObjectId(req.user.id),
        _id: mongoose.Types.ObjectId(req.body.researchId),
      });
      if (research) {
        const diff =
          req.body.rate -
          research.likes.find((like) => like.id == req.user.id).rate;
        await Research.findOneAndUpdate(
          {
            "likes.id": mongoose.Types.ObjectId(req.user.id),
            _id: mongoose.Types.ObjectId(req.body.researchId),
          },
          {
            $set: { "likes.$.rate": req.body.rate },
            rate: research.rate + diff,
          }
        );
        await Users.findOneAndUpdate(
          {
            "likedresearchpaper.id": mongoose.Types.ObjectId(
              req.body.researchId
            ),
            _id: mongoose.Types.ObjectId(req.user.id),
          },
          {
            $set: { "likedresearchpaper.$.rate": req.body.rate },
          }
        );
      } else {
        let research = await Research.findById(
          mongoose.Types.ObjectId(req.body.researchId)
        );
        await Research.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(req.body.researchId) },
          {
            $push: {
              likes: {
                id: mongoose.Types.ObjectId(req.user.id),
                rate: req.body.rate,
              },
            },
            rate: research.rate + req.body.rate,
          }
        );
        await Users.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.user.id),
          },
          {
            $push: {
              likedresearchpaper: {
                id: mongoose.Types.ObjectId(req.body.researchId),
                rate: req.body.rate,
              },
            },
          }
        );
      }
      res.send();
    } catch (error) {
      console.log(error.message);
    }
  },
  postresearchpaper: async (req, res, next) => {
    try {
      const { title, subtitle, data, event, text, image, tags, report } =
        req.body;
      const research = new Research({
        userId: req.user.id,
        title,
        subtitle,
        data,
        event,
        text,
        image,
        tags,
        report,
      });
      const existPaper = await Research.exists({ userId: req.user.id, event });
      if (existPaper) {
        return res.status(400).json({
          success: true,
          message: "You already submitted paper on this event",
        });
      }
      const researchData = await Research.create(research);
      res.status(201).json({
        success: true,
        message: "Research paper created successfully",
      });
      next();
    } catch (error) {
      console.error(error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  },
  updateresearchpaper: async (req, res) => {
    try {
      const researchId = req.body.researchid;
      const research = {
        title: req.body.title,
        subtitle: req.body.subtitle,
        data: req.body.data,
        text: req.body.text,
        image: req.body.image,
      };
      const researchPaper = await Research.findOneAndUpdate(
        { userId: req.user.id, _id: researchId },
        research
      );
      if (!researchPaper) {
        throw new Error("paper not updated successfully");
      }
      res.status(201).json({
        success: true,
        message: "Research paper updated successfully",
      });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  },
  deletePost: async (req, res) => {
    try {
      if (req.user.admin) {
        const data = await Research.findByIdAndDelete(req.body.id);
        if (data.image) {
          const filelocation = path.resolve(
            __dirname,
            "..",
            "uploads",
            "images",
            data.image
          );
          filelocation && (await unlinkAsync(filelocation));
        }
      } else {
        const data = await Research.findOneAndDelete({
          _id: req.body.id,
          userId: req.user.id,
        });
        if (data.image) {
          const filelocation = path.resolve(
            __dirname,
            "..",
            "uploads",
            "images",
            data.image
          );
          filelocation && (await unlinkAsync(filelocation));
        }
      }
      res.send("Event Deleted successfully");
    } catch (error) {
      res.send(error.message);
    }
  },

  rateresearch: async (req, res) => {
    try {
      userid = "61ee65c2423ea10b3be3d4bd";
      rate = 5;
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
  makePaperFeatured: async (req, res) => {
    try {
      const updatedPaper = await Research.findByIdAndUpdate(req.body.id, {
        isFeatured: true,
      });
      res.send({ success: true, message: "Paper is featured successfully" });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  },
  getFeaturedPapers: async (req, res) => {
    try {
      const pageno = req.query.count >= 1 ? req.query.count - 1 : 0;
      const data = await Research.find({ isFeatured: true })
        .sort({ createdAt: -1 })
        .select(
          "id title subtitle likes image text updatedAt createdAt rate isFeatured"
        )
        .populate([{ path: "userId", select: "name" }])
        .skip(pageno * 20)
        .limit(20)
        .allowDiskUse(true);
      const totalPaper = await Research.countDocuments({ isFeatured: true });

      res.send({ data, totalPaper });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  },
  // TODO: make this more efficient
  getPointByLinkedinShareLink: async (req, res) => {
    try {
      const { link } = req.body;
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        //headless: false,
      });
      const page = await browser.newPage();

      //monitor requests
      await page.setRequestInterception(true);
      //check resourceType is script
      page.on("request", (request) => {
        if (request.resourceType() === "script") request.abort();
        else request.continue();
      });

      page.setDefaultNavigationTimeout(0);
      page.setDefaultTimeout(0);
      await page.goto(link);
      const data = await page.evaluate(() => {
        var a = document.querySelectorAll("a");
        const result = {
          hastagDetails: {
            predictram: false,
            knowyourrisk: false,
          },
          hastagPresent: false,
          postid: null,
          tagPresent: false,
          pointEarn: false,
          owner: false,
          aleadyShared: false,
        };
        for (var i = 0; i < a.length; i++) {
          if (a[i].href.includes("public_post_feed-cta-banner-cta")) {
            break;
          }
          if (
            a[i].href.includes("hashtag") &&
            a[i].href.toLocaleLowerCase().includes("predictram")
          ) {
            result.hastagDetails.predictram = true;
          }
          if (
            a[i].href.includes("hashtag") &&
            a[i].href.toLocaleLowerCase().includes("knowyourrisk")
          ) {
            result.hastagDetails.knowyourrisk = true;
          }
          if (
            a[i].href.includes(
              "https%3A%2F%2Fdev%2Epredictram%2Ecom%2Fviewresearch%2F"
            )
          ) {
            result.postid = a[i].href
              .replace("https://www.linkedin.com/redir/redirect?url=", "")
              .match("[0-9a-fA]{24}")[0];
          }
          if (
            a[i].href.includes(
              "https://in.linkedin.com/company/predictram-official"
            )
          ) {
            result.tagPresent = true;
          }
        }

        const allHashTagPresent = Object.values(result.hastagDetails).every(
          (el) => el === true
        );

        if (allHashTagPresent) {
          result.hastagPresent = true;
        }

        return result;
      });
      data.owner = await Research.exists({
        userId: req.user.id,
        _id: data.postid,
      });
      data.aleadyShared = await Research.exists({
        userId: req.user.id,
        _id: data.postid,
        isShared: true,
      });
      if (
        !data.aleadyShared &&
        data.hastagPresent &&
        data.tagPresent &&
        data.owner
      ) {
        const paper = await Research.findOneAndUpdate(
          { userId: req.user.id, _id: data.postid },
          { isShared: true }
        );
        if (paper) {
          data.pointEarn = true;
        }
      }

      console.log(data);
      res.apiResponse(true, "Link Submitted", data);
    } catch (err) {
      res.apiResponse(false, err.message, null);
    }
  },
};
