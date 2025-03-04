const { default: axios } = require("axios");
const ZohoAccessToken = require("../models/accessToken");
const EmailService = require("./EmailService");

const mongoose = require("mongoose");
const nodeCache = require("../utils/nodeCache");

mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.wdfuc.mongodb.net/interns?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

class ZohoService {
  async generateRefreshToken() {
    try {
      const { data } = await axios.post(
        `https://accounts.zoho.in/oauth/v2/token?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`
      );

      nodeCache.set("zohoToken", {
        access_token: data?.access_token,
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      });
      //   await ZohoAccessToken.findOneAndUpdate(
      //   {
      //     key: "zohoToken",
      //   },
      //   {
      // access_token: data?.access_token,
      // refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      // type: "zohoToken",
      //   },
      //   { upsert: true }
      // );
      // return savedToken;
    } catch (err) {
      console.log(err);
      EmailService.sendCustomisedEmail(
        "ankanbhaumik80@gmail.com",
        "EMAIL FOR ZOHO LOGIN",
        `error msg = ${err?.message}`
      );
    }
  }
}

module.exports = new ZohoService();
