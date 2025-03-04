const admin = require("firebase-admin");
const fcm = require("fcm-notification");

const serviceAccount = require("../config/push_notification_key.json");
const FcmToken = require("../models/fcmToken");
const certPath = admin.credential.cert(serviceAccount);
const FCM = new fcm(certPath);

class InvestorEventService {
  static async sendPushNotification({ title, body, eventId }) {
    try {
      const fetchTokens = await FcmToken.find({ sendNotification: true });
      const tokens = fetchTokens.map((token) => token.token);

      tokens.forEach((token) => {
        const message = {
          notification: {
            title: title,
            body: body,
          },
          data: {
            id: eventId,
          },
          token,
        };

        FCM.send(message, function (err, response) {
          if (err) {
            throw new Error(err);
          } else {
            return response;
          }
        });
      });
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = InvestorEventService;
