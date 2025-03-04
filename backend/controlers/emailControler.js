const Mongoose = require("mongoose");
const EmailGroup = require("../models/emailgroup");
const users = require("../models/users");
const QueryFilter = require("../utils/QueryFilter");
const EmailService = require("../services/EmailService");

module.exports = {
  createEmailGroup: async (req, res) => {
    try {
      function objectIdWithTimestamp(timestamp) {
        if (typeof timestamp == "string") {
          timestamp = new Date(timestamp);
        }
        var hexSeconds = Math.floor(timestamp / 1000).toString(16);
        var constructedObjectId = Mongoose.Types.ObjectId(
          hexSeconds + "0000000000000000"
        );

        return constructedObjectId;
      }
      const recipients = await users.find(
        {
          _id: {
            $gte: objectIdWithTimestamp(new Date(req.body.startdate)),
            $lte: objectIdWithTimestamp(new Date(req.body.enddate)),
          },
        },
        { name: 1, email: 1, userId: "$_id", _id: 0, createdAt: 1 }
      );
      console.log(recipients.length);
      req.body.recipients = recipients;
      const newEmailGroup = new EmailGroup(req.body);
      const emailGroup = await EmailGroup.create(newEmailGroup);
      res.send({ emailGroup, message: "Email Group successful Created" });
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: "Group creation Unsuccessful." });
    }
  },
  getEmailGroup: async (req, res) => {
    try {
      const queryFilter = new QueryFilter(["id", "startdate", "enddate"]);
      const filteredParams = queryFilter.filter(req.query);
      const query = {};
      if (!!filteredParams.id) {
        query._id = filteredParams.id;
      }
      if (!!filteredParams.startdate) {
        query.startdate = filteredParams.startdate;
      }
      if (!!filteredParams.enddate) {
        query.enddate = filteredParams.enddate;
      }
      let emailGroups;
      if (Object.keys(query).length > 0) {
        emailGroups = await EmailGroup.find(query);
      } else {
        emailGroups = await EmailGroup.find({});
      }
      res.send(emailGroups);
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: "Email Group fetch Unsuccessful." });
    }
  },
  deleteEmailGroup: async (req, res) => {
    try {
      const id = req.params.id;
      await EmailGroup.findByIdAndDelete(id);
      res.send({ message: "Email Group successful Deleted" });
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: "Email Group deletion failed" });
    }
  },
  sendIndividualEmail: async (req, res) => {
    try {
      const { groups, subject, htmlbody, textbody } = req.body;
      const listOfusers = [];
      for (let id of groups) {
        const { recipients } = await EmailGroup.findById(id, {
          _id: 0,
          recipients: 1,
        });
        listOfusers.push(...recipients);
      }
      listOfusers.map(async (user, index) => {
        var Obj = {
          "{{user_name}}": user.name,
          "{{email_id}}": user.email,
        };
        let newhtmlBody = htmlbody.replace(
          /{{user_name}}|{{email_id}}/gi,
          function (matched) {
            return Obj[matched];
          }
        );

        setTimeout(async () => {
          const sendingMail = await EmailService.sendCustomisedEmail(
            user.email,
            subject,
            newhtmlBody
          );
        }, index * 5000);
      });
      res.send({ message: "Email sent successfully" });
    } catch (err) {
      res.status(500).send({ success: false, message: "Email sending failed" });
    }
  },
  sendGroupEmail: async (req, res) => {
    try {
      const { groups, subject, htmlbody, textbody } = req.body;
      const listOfusers = [];
      for (let id of groups) {
        const { recipients } = await EmailGroup.findById(id, {
          _id: 0,
          recipients: 1,
        });
        listOfusers.push(...recipients);
      }
      console.log(listOfusers);
      res.send({ message: "Email sent successfully" });
    } catch (err) {
      res.status(500).send({ success: false, message: "Email sending failed" });
    }
  },
};
