const { default: axios } = require("axios");
const fyersAccessToken = require("../models/accessToken");
const EmailService = require("./EmailService");
const mongoose = require("mongoose");
const redisClient = require("../utils/redisCache");

mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.wdfuc.mongodb.net/interns?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

class FyersService {
  constructor(fyersAppId, appIdHash, redirect_uri) {
    (this.fyersAppId = fyersAppId),
      (this.appIdHash = appIdHash),
      (this.redirect_uri = redirect_uri);
  }

  fyersAuthUrl() {
    const state = "sample_state";
    const url = `https://api.fyers.in/api/v2/generate-authcode?client_id=${this.fyersAppId}&redirect_uri=${this.redirect_uri}&response_type=code&state=${state}`;
    console.log(url);
    return url;
  }

  async fyersAuthUsingRefreshToken() {
    let token = await redisClient.get("fyersToken");
    token = token && JSON.parse(token);
    // const token = await fyersAccessToken.findOne({
    //   key: "fyersToken",
    // });

    const reqBody = {
      grant_type: "refresh_token",
      appIdHash: this.appIdHash,
      refresh_token: token?.refresh_token,
      pin: "2020",
    };

    try {
      const { data } = await axios.post(
        "https://api.fyers.in/api/v2/validate-refresh-token",
        reqBody
      );
      if (data?.code === 200) {
        // await fyersAccessToken.findOneAndUpdate({ key: "fyersToken" }, data, {
        //   upsert: true,
        // });
        await redisClient.set(
          "fyersToken",
          JSON.stringify({
            access_token: data.access_token,
            refresh_token: token.refresh_token,
            updatedAt: new Date(),
          })
        );
      } else {
        // trigger mail
        const url = this.fyersAuthUrl();
        EmailService.sendCustomisedEmail(
          "ankanbhaumik80@gmail.com",
          "EMAIL FOR FYERS LOGIN",
          `LOGIN URL = ${url} \n error msg = ${data?.message}`
        );
      }
    } catch (err) {
      console.log(err.message);
      // trigger mail
      const url = this.fyersAuthUrl();
      EmailService.sendCustomisedEmail(
        "ankanbhaumik80@gmail.com",
        "EMAIL FOR FYERS LOGIN",
        `LOGIN URL = ${url} \n error msg = ${err?.message}`
      );
    }
  }
}

module.exports = FyersService;
