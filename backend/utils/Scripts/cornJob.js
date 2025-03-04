const cron = require("node-cron");
const { fyersService } = require("../../controlers/broker/fyersControler");
const ZohoService = require("../../services/ZohoService");
const { updateEventSummary } = require("./eventSummaryUpdate");
const redisClient = require("../redisCache");

console.log("Corn Job Started...");

cron.schedule("0 1 * * *", async () => {
  try {
    await fyersService.fyersAuthUsingRefreshToken();
  } catch (error) {
    console.error("Error in async process:", error);
  }
});
// // generate zoho access token every 45 min
cron.schedule("*/45 * * * *", async () => {
  try {
    await ZohoService.generateRefreshToken();
  } catch (error) {
    console.error("Error in async process:", error);
  }
});

cron.schedule("*/90 * * * *", async () => {
  try {
    await updateEventSummary(false);
  } catch (error) {
    console.error("Error in Event Summary update:", error);
  }
});

// notifications stopped for now, needs update like hiding the mails of the users and also sending only one mail at a time
// cron.schedule("0 9 * * Sunday", () => {
//   sendNotificationMail();
// });
