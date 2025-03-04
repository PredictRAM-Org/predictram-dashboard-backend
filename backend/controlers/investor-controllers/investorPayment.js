const Mongoose = require("mongoose");
const razorpay = require("razorpay");
const investorsAccount = require("../../models/investorsAccount");

const Razorpay = new razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

module.exports = {
  investorPaymentGateway: async (req, res) => {
    const payment_capture = 1;
    const amounts = [29900, 54900];
    const currency = "INR";

    const options = amounts.map((amount) => {
      return {
        amount,
        currency,
        receipt: req.body.id,
        payment_capture,
      };
    });

    try {
      const orderPromises = options.map((option) =>
        Razorpay.orders.create(option)
      );
      const orderResponse = await Promise.all(orderPromises);

      const razorpayOrders = orderResponse.map((order) => {
        return {
          id: order.id,
          currency: order.currency,
          amount: order.amount,
        };
      });
      res.send(razorpayOrders);
    } catch (e) {
      console.log(e);
    }
  },
  confirmInvestorPayment: async (req, res) => {
    const { investorId, paymentId, orderId, expiryDate } = req.body;
    await investorsAccount
      .findByIdAndUpdate(investorId, {
        "payments.premiumUser": true,
        "payments.paymentId": paymentId,
        "payments.orderId": orderId,
        ...(expiryDate ? { "payments.expiry": expiryDate } : {}),
      })
      .then((data) => {
        res
          .status(200)
          .send({ success: true, message: "Investor updated successfully" });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  confirmInvestorPaymentUsingToken: async (req, res) => {
    const { investorId, token } = req.body;
    if (token === process.env.PREMIUM_TOKEN) {
      await investorsAccount
        .findByIdAndUpdate(Mongoose.Types.ObjectId(investorId), {
          "payments.premiumUser": true,
        })
        .then(() => res.send({ message: "Investor updated successfully" }))
        .catch((err) => console.log(err));
    } else {
      return res.status(401).send({
        success: false,
        message: "The token you entered is not correct",
      });
    }
  },

  giveInvestorFreePremiumMembership: async (req, res) => {
    const { investorId, expiryDate } = req.body;
    await investorsAccount
      .findByIdAndUpdate(Mongoose.Types.ObjectId(investorId), {
        "payments.premiumUser": true,
        professional: true,
        "payments.expiry": expiryDate,
      })
      .then(() =>
        res.send({
          success: true,
          message: "Enjoy our premium features for 2 months",
        })
      )
      .catch((err) => res.status(400).send({ success: false, message: err }));
  },
  cancelInvestorFreePremiumMembership: async (req, res) => {
    const { investorId } = req.body;
    await investorsAccount
      .findByIdAndUpdate(Mongoose.Types.ObjectId(investorId), {
        "payments.premiumUser": false,
        professional: false,
        "payments.triedFreePremium": true,
      })
      .then(() =>
        res.send({
          success: true,
          message: "Your free premium membership period has expired",
        })
      )
      .catch((err) => res.status(400).send({ success: false, message: err }));
  },
};
