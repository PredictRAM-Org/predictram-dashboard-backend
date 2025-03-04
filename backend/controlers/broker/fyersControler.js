const { default: axios } = require("axios");
const FyersAPI = require("fyers-api-v3").fyersModel;
const EtfTransaction = require("../../models/etfTransactions");
const isDev = require("../../utils/env");
const FyersService = require("../../services/FysersService");
const fyersAccessToken = require("../../models/accessToken");
const redisClient = require("../../utils/redisCache");
const EmailService = require("../../services/EmailService");
let fyersAppId = "OU4MHNZV2Z-100";
let appIdHash =
  "f5dc3e85f18b88a94e492591f5d42e5e936836578c31759224b0fccb17834e06";
let secret_key = "U1Q0MGHITH";
let redirect_uri = "http://127.0.0.1:5000/api/users/fyers/login";

if (isDev) {
  fyersAppId = "OU4MHNZV2Z-100";
  appIdHash =
    "eac1dfa3b27ebee482e9f272c700f5d90d35f1f5774f1f30b48264e304a4d8cc";
  secret_key = "R6HHJAIOH4";
  redirect_uri = "http://127.0.0.1:5000/api/users/fyers/login";
} else {
  fyersAppId = "1S0LX7XTKP-100";
  appIdHash =
    "bfcbb4871d1e51c064a1d257e3c81d2b4751d313d59fd78133b5d3b950fc2870";
  secret_key = "KFBUKIXNO9";
  redirect_uri = "https://dev.predictram.com/api/users/fyers/login";
}

var fyers = new FyersAPI();

fyers.setAppId(fyersAppId);

const fyersService = new FyersService(fyersAppId, appIdHash, redirect_uri);

module.exports = {
  fyersService: fyersService,
  fyerslogin: async (req, res) => {
    const { auth_code, refresh_token } = req.body;
    let token;
    try {
      if (refresh_token) {
        const payload = {
          grant_type: "refresh_token",
          appIdHash: appIdHash,
          pin: "2020",
          refresh_token: refresh_token,
        };
        token = await axios.post(
          "https://api.fyers.in/api/v2/validate-refresh-token",
          payload
        );
        const { data } = token;

        return res.send({ token: data });
      } else {
        token = await fyers.generate_access_token({
          auth_code: auth_code,
          secret_key: secret_key,
        });
        if (token.code === 200) {
          return res.send({ token, message: "Login successful" });
        } else {
          return res.status(400).send({ message: token.message });
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(404).send({ message: "Fyers session expired" });
    }
  },
  fyersAuth: async (req, res) => {
    const { auth_code } = req.query;
    const reqBody = {
      auth_code: auth_code,
      secret_key: secret_key,
    };

    try {
      const response = await fyers.generate_access_token(reqBody);
      if (response?.code === 200) {
        // await fyersAccessToken.findOneAndUpdate(
        //   { key: "fyersToken" },
        //   response,
        //   { upsert: true }
        // );
        await redisClient.set(
          "fyersToken",
          JSON.stringify({ ...response, createdAt: new Date() })
        );
        return res.apiResponse(true, "token generated successfully", response);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },

  fyersQuotes: async (req, res) => {
    try {
      let token = await redisClient.get("fyersToken");
      token = token && JSON.parse(token);
      // const token = await fyersAccessToken.findOne({
      //   key: "fyersToken",
      // });
      fyers.setAccessToken(token?.access_token);
      const stocks = req.query?.symbols
        ?.split(",")
        .map((stock) => `NSE:${stock}-EQ`);

      const data = await fyers.getQuotes([stocks]);
      if (data?.code === 200) {
        res.apiResponse(true, "stock price data successfully fetched", data);
      } else {
        throw new Error(data?.message);
      }

      // else if (data?.code === -15) {
      //   await fyersService.fyersAuthUsingRefreshToken(refresh_token);
      //   throw new Error(data?.message);
      // }
    } catch (err) {
      // EmailService.sendCustomisedEmail(
      //   "ankanbhaumik80@gmail.com",
      //   "EMAIL FOR FYERS LOGIN",
      //   `LOGIN URL = ${fyersService.fyersAuthUrl()} \n error msg = ${
      //     err?.message
      //   }`
      // );
      res.apiResponse(false, err.message);
    }
  },

  fyersQuotesService: async (stocks) => {
    try {
      let token = await redisClient.get("fyersToken");
      token = token && JSON.parse(token);
      // const token = await fyersAccessToken.findOne({
      //   key: "fyersToken",
      // });
      fyers.setAccessToken(token?.access_token);
      const data = await fyers.getQuotes([stocks]);
      if (data?.code === 200) {
        return data;
      } else {
        throw new Error(data?.message);
      }
    } catch (err) {
      // EmailService.sendCustomisedEmail(
      //   "ankanbhaumik80@gmail.com",
      //   "EMAIL FOR FYERS LOGIN",
      //   `LOGIN URL = ${fyersService.fyersAuthUrl()} \n error msg = ${
      //     err?.message
      //   }`
      // );
      return null;
    }
  },

  fyersprofile: async (req, res) => {
    const { access_token } = req.query;
    fyers.setAccessToken(access_token);
    try {
      const profile = await fyers.get_profile();
      if (profile?.code === 200) {
        res.status(200).send({ profile, expired: false });
      } else {
        res.status(200).send({ message: "Session expired", expired: true });
      }
    } catch (err) {
      res.send({ message: err.message });
    }
  },
  fyersFunds: async (req, res) => {
    const { access_token } = req.query;
    fyers.setAccessToken(access_token);
    try {
      const funds = await fyers.get_funds();
      if (funds?.code === 200) {
        res.status(200).send({
          fund: funds?.fund_limit.find((fund) => fund?.id === 10)?.equityAmount,
          expired: false,
        });
      } else {
        res.status(200).send({ message: "Session expired", expired: true });
      }
    } catch (err) {
      res.send({ message: err.message });
    }
  },
  fyersHoldings: async (req, res) => {
    const { access_token } = req.query;
    fyers.setAccessToken(access_token);
    try {
      const holdings = await fyers.get_holdings();
      if (holdings?.code === 200) {
        res.status(200).send({ holdings, expired: false });
      } else {
        res.status(200).send({ message: "Session expired", expired: true });
      }
    } catch (err) {
      res.send({ message: err.message });
    }
  },
  fyersPosition: async (req, res) => {
    const { access_token } = req.query;
    fyers.setAccessToken(access_token);
    try {
      const positions = await fyers.get_positions();
      if (positions?.code === 200) {
        res.status(200).send({ positions, expired: false });
      } else {
        res.status(200).send({ message: "Session expired", expired: true });
      }
    } catch (err) {
      res.send({ message: err.message });
    }
  },
  fyersPlaceMultiOrder: async (req, res) => {
    const { stocks, access_token, userId, totalPrice } = req.body;
    try {
      const data = stocks.map((stock) => {
        return {
          symbol: stock,
          qty: 1,
          type: 2,
          side: 1,
          productType: "CNC",
          limitPrice: 0,
          stopPrice: 0,
          disclosedQty: 0,
          validity: "DAY",
          offlineOrder: "TRUE",
          stopLoss: 0,
          takeProfit: 0,
        };
      });
      const req_body = { data, app_id: fyersAppId, token: access_token };
      console.log(req_body);
      const newtransaction = { userId, totalPrice, purchasedStocks: stocks };
      console.log(newtransaction);
      res.status(200).send({ req_body, message: "orders successfully placed" });
      // const orders = await fyers.place_multi_order(req_body);
      // if (orders?.code === 200) {
      //   const transaction=await EtfTransaction.create(newtransaction);
      //   res.status(200).send({orders,message:"orders successfully placed"});
      // } else {
      //   res.status(404).send({ message: "orders place failed" });
      // }
    } catch (err) {
      res.send({ message: err.message });
    }
  },
};
