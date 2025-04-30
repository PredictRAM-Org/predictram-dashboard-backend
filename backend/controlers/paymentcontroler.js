const Mongoose = require("mongoose");
const razorpay = require("razorpay");
const Investors = require("../models/investorsAccount");
const ModelCreditTransaction = require("../models/modelCreditTransaction");

const Razorpay = new razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

module.exports = {
  getPaymentDetails: async (req, res) => {
    try {
      const filter = req.query;

      const paymentDetails = await Investors.find(filter, {
        uniqueId: 1,
        firstName: 1,
        lastName: 1,
        "payments.premiumUser": 1,
        "payments.triedFreePremium": 1,
      });

      const modifiedDetails = paymentDetails.map((user) => ({
        uniqueId: user.uniqueId ? user.uniqueId : "Not Available",
        firstName: user.firstName ? user.firstName : "Not Available",
        lastName: user.lastName ? user.lastName : "Not Available",
        premiumUser: user.payments.premiumUser === false ? "False" : "True",
        triedFreePremium:
          user.payments.triedFreePremium === false ? "False" : "True",
      }));

      res.apiResponse(true, "Payment details", modifiedDetails);
    } catch (err) {
      res.apiResponse(false, err.message);
    }
  },
  paymentGateway: async (req, res) => {
    const payment_capture = 1;
    const amounts = [24900, 500000];
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
  confirmPayment: async (req, res) => {
    const { userId, paymentId, orderId } = req.body;
    await Users.findByIdAndUpdate(userId, {
      "payments.premiumUser": true,
      "payments.paymentId": paymentId,
      "payments.orderId": orderId,
    }).then((err, data) => {
      if (err) {
        console.log(err);
      } else {
        res
          .status(200)
          .send({ success: true, message: "User updated successfully" });
      }
    });
  },
  confirmPaymentUsingToken: async (req, res) => {
    const { userId, token } = req.body;
    if (token === process.env.PREMIUM_TOKEN) {
      await Users.findByIdAndUpdate(Mongoose.Types.ObjectId(userId), {
        "payments.premiumUser": true,
      })
        .then(() => res.send({ message: "User updated successfully" }))
        .catch((err) => console.log(err));
    } else {
      return res.status(401).send({
        success: false,
        message: "The token you entered is not correct",
      });
    }
  },

  giveFreePremiumMembership: async (req, res) => {
    const { userId, expiryDate } = req.body;
    await Users.findByIdAndUpdate(Mongoose.Types.ObjectId(userId), {
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

  cancelFreePremiumMembership: async (req, res) => {
    const { userId } = req.body;
    await Users.findByIdAndUpdate(Mongoose.Types.ObjectId(userId), {
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

  createPaymentOrder: async (req, res) => {
    const payment_capture = 1;
    const amount = req.body.amount * 100;
    const currency = "INR";

    const option = {
      amount,
      currency,
      receipt: req.body.userId,
      payment_capture,
    };

    try {
      const order = await Razorpay.orders.create(option);

      const razorpayOrder = {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
      };

      res.send(razorpayOrder);
    } catch (e) {
      console.log(e);
    }
  },

  confirmModelCreditPayment: async (req, res) => {
    try {
      const { userId, paymentId, orderId } = req.body;
      const paymentDetails = await Razorpay.payments.fetch(paymentId);
      console.log(paymentDetails);
      await Investors.findByIdAndUpdate(userId, {
        $inc: { model_credit: paymentDetails.amount / 100 },
      });
      await ModelCreditTransaction.create({
        user: userId,
        modelName: "ALL",
        description: "Model Credit via Razorpay",
        type: "CREDIT",
        amount: paymentDetails.amount / 100,
        orderId: orderId,
        paymentId: paymentId,
      });
      res.status(200).send({
        success: true,
        message: "Model credit added successfully",
      });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  },
};
