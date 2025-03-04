const nodemailer = require("nodemailer");
const axios = require("axios");
const DateTimeService = require("./DateTimeService");

class EmailService {
  constructor() {
    const config = {
      service: "gmail",
      auth: {
        user: "predictram.noreply.otp",
        pass: "acegcrmzdrhnitkp",
      },
    };
    this.transporter = nodemailer.createTransport(config);
  }

  async sendOTP(sendingTo, otp) {
    try {
      const emailStatus = await this.sendCustomisedEmail(
        sendingTo,
        "PredictRam OTP",
        `<p>Your otp is ${otp}. It is valid for 5 min. Do not share otp with anyone.</p>`
      );
      return emailStatus;
    } catch (err) {
      console.error(err);
    }
  }

  async sendCustomisedEmail(receiverMail, subject, message) {
    try {
      const sendingMail = await axios.get(`${process.env.MAIL_FUNCTION}`, {
        params: { destinationMail: receiverMail, subject, body: message },
      });

      if (sendingMail) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  generateEmailTemplateCreator(title, date, fromTime, toTime, sessionLink) {
    const emailTemplate = `
                <html>
                  <body>
                    <p>Dear Creator,</p>
                    <p>We are pleased to inform you that your session is booked.
                    <h2> Session Details: </h2>
                    <h3> Title: ${title}</>
                    <h3> Date: ${DateTimeService.getLocalDate(date)}</h3>
                    <h3> Time: ${DateTimeService.get12HrTime(
                      fromTime
                    )} - ${DateTimeService.get12HrTime(toTime)}</h3>
                    <h3> Session Link: ${
                      sessionLink ? sessionLink : "Will be provided soon"
                    } </h3>
                <p>We look forward to your session and appreciate your contribution.</p>
                    <p>Sincerely,<br>PredictRAM Team</p>
                  </body>
                </html>
                `;
    return emailTemplate;
  }

  generateEmailTemplateUser(name, title, date, fromTime, toTime, sessionLink) {
    const emailTemplate = `
                <html>
                  <body>
                    <p>Hi ${name},</p>
                    <p>We are pleased to inform you are registered for our session.
                    <h2> Session Details: </h2>
                    <h3> Title: ${title}</>
                    <h3> Date: ${DateTimeService.getLocalDate(date)}</h3>
                    <h3> Time: ${DateTimeService.get12HrTime(
                      fromTime
                    )} - ${DateTimeService.get12HrTime(toTime)}</h3>
                    <h3> Session Link: ${
                      sessionLink ? sessionLink : "Will be provided soon"
                    } </h3>
                <p>We look forward to your attendance and hope you will get to learn something new.</p>
                    <p>Sincerely,<br>PredictRAM Team</p>
                  </body>
                </html>
                `;
    return emailTemplate;
  }
}

module.exports = new EmailService();
