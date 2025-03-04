const axios = require("axios");

const botConfig = {
  TOKEN: "6299422421:AAH8OPXiuWssLPfyFAT_gS-So5AGbe9ends",
  // CHAT_ID: "-1001504507325",
  CHAT_ID: "-1001980994382",
  // CHAT_ID: "-1001601058171",
};

const _dateFormat = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

const telegramNotifier = (eventDetails) => {
  try {
    const { _id, name, details, enddate } = eventDetails;
    const message = `A new event has been published!

    Title: ${name}
    Description: ${details}
    End Date: ${new Date(enddate).toDateString()}
    Visit: https://dev.predictram.com/eventdetails/${_id.toString()}

    `;

    telegramSendingAction(message);
  } catch (error) {
    console.error(error.message);
  }
};

const telegramDeadlineNotifier = (eventDetails) => {
  try {
    const { _id, name, details, enddate } = eventDetails;
    const message = `Event Deadline Warning!!!,

    This is a friendly reminder that the event (details given below) will end tomorrow. Please make sure to submit your research papers and portfolio as soon as possible. We appreciate your hard work and dedication. Thank you for your cooperation.

    Event Details:
    
    Title: ${name}
    Description: ${details}
    End Date: ${new Date(enddate).toDateString()}
    Visit: https://dev.predictram.com/eventdetails/${_id.toString()}

    Sincerely,
    Team PredictRAM

    `;

    telegramSendingAction(message);
  } catch (error) {
    console.error(error.message);
  }
};

const telegramSendingAction = async (message) => {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botConfig.TOKEN}/sendMessage`,
      {
        chat_id: botConfig.CHAT_ID,
        text: message,
      }
    );

    const messageId = response.data.result.message_id;

    const data = await axios.post(
      `https://api.telegram.org/bot${botConfig.TOKEN}/pinChatMessage`,
      {
        chat_id: botConfig.CHAT_ID,
        message_id: messageId,
      }
    );

    console.log("successfully notified telegram channels");
  } catch (err) {
    console.error(error.message);
  }
};

module.exports = { telegramNotifier, telegramDeadlineNotifier };
