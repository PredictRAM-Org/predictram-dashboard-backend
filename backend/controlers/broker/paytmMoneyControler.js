const axios = require("axios");
const api_key = "47acc8e3474244309bf87f5a661d1aa2";
const api_secret_key = "a97d18ca431b431990db63466352ab7b";
const stockSecurityId = require("../../models/stockSecurityId");
module.exports = {
  paytmMoneyLogin: async (req, res) => {
    const { requestToken } = req.body;
    const payload = {
      api_key,
      api_secret_key,
      request_token: requestToken,
    };
    try {
      const { data } = await axios.post(
        "https://developer.paytmmoney.com/accounts/v2/gettoken",
        payload
      );
      return res.send(data);
    } catch (err) {
      console.log(err.message);
      res.status(404).send({ message: "Paytm Money Request Token Expired" });
    }
  },
  paytmMoneyProfile: async (req, res) => {
    const { access_token } = req.query;
    try {
      const { data } = await axios.get(
        "https://developer.paytmmoney.com/accounts/v1/user/details",
        {
          headers: {
            "x-jwt-token": access_token,
          },
        }
      );
      res.status(200).send({ profile: data, expired: false });
    } catch (err) {
      res.send({ message: err.message });
    }
  },
  paytmMoneyHoldings: async (req, res) => {
    const { access_token } = req.query;
    try {
      const { data } = await axios.get(
        "https://developer.paytmmoney.com/holdings/v1/get-user-holdings-data",
        {
          headers: {
            "x-jwt-token": access_token,
          },
        }
      );
      res.status(200).send({ holdings: data, expired: false });
    } catch (err) {
      res.send({ message: err.message });
    }
  },
  paytmMoneyLivePrice: async (req, res) => {
    const { access_token, symbols, mode = "LTP" } = req.query;
    try {
      const stockData = await stockSecurityId.find({
        symbol: { $in: symbols.split(",") },
      });

      const pref = stockData.map(
        (sdata) => `${sdata?.exchange}:${sdata?.security_id}:EQUITY`
      );

      const {
        data: { data },
      } = await axios.get(
        `https://developer.paytmmoney.com/data/v1/price/live?mode=${mode}&pref=${pref.join(
          ","
        )}`,
        {
          headers: {
            "x-jwt-token": access_token,
          },
        }
      );

      const priceWithSymbol = stockData.map((sdata) => {
        const priceData = data.find(
          (d) => d?.security_id == sdata?.security_id
        );
        return { ...priceData, symbol: sdata?.symbol };
      });

      res.status(200).send({ livePrices: priceWithSymbol, expired: false });
    } catch (err) {
      res.send({ message: err.message });
    }
  },
};
