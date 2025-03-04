const { google } = require("googleapis");
const Session = require("../models/session");
const DateTimeService = require("./DateTimeService");
const EmailService = require("./EmailService");
const RiskQuestionsModel = require("../models/riskscoreQuestions");
const adviceSession = require("../models/adviceSession");

const portfolioResults = [
  {
    status: "Very Conservative",
    color: "#7ECF82",
    desc: "As a very conservative investor, your portfolio will be invested in the most risk-averse areas such as cash and fixed income securities. This approach offers a high degree of stability and should minimize the chances of substantial short-term volatility. Your main goal is preservation of wealth. The overall return, while not guaranteed, should fall within a narrow range of possibilities. However, particularly for time periods greater than five years, these returns may underperform the returns achievable from a higher-risk approach",
  },
  {
    status: "Conservative",
    color: "#7ECF82",
    desc: "As a conservative investor, your portfolio will be invested primarily in risk-averse areas such as cash and fixed-income securities with only a modest exposure to equities. This approach concentrates on stability rather than maximizing return and should limit the chances of substantial short-term volatility. The overall return, while not guaranteed, should fall within a relatively narrow range of possibilities. However, particularly for time periods greater than five years, these returns may underperform the returns achievable from a higher-risk approach",
  },
  {
    status: "Moderate",
    color: "#ffdf00",
    desc: "As a moderate investor, your portfolio will include investment in equities, balanced by exposure to more risk-averse areas of the market such as cash, fixed-income securities, and real estate. This approach aims to achieve a balance between stability and return but is likely to involve at least some short-term volatility. The overall return is not guaranteed, although the range of possible outcomes should not be extreme. In most circumstances, particularly for time periods greater than five years, these returns should outperform the returns achievable from a more conservative approach but may underperform the returns achievable from a higher-risk approach",
  },
  {
    status: "Moderately Aggressive",
    color: "#F2AF33",
    desc: "As an moderately aggressive investor, your portfolio will be invested primarily in equities. This approach concentrates on achieving a good overall return on your investment while avoiding the most speculative areas of the market. Significant short-term fluctuations in value can be expected. The eventual return for the time period over which you invest could fall within a relatively wide range of possibilities. In most circumstances, particularly for time periods greater than five years, these returns should outperform the returns achievable from a more conservative approach",
  },
  {
    status: "Very Aggressive",
    color: "#F55050",
    desc: "As a very aggressive investor, your portfolio will be invested in equities and will include exposure to more speculative areas of the market. The aim is to maximize return while accepting the possibility of large short-term fluctuations in value and even the possibility of longer-term losses. The eventual return for the time period over which you invest could fall within a wide range of possibilities. In most circumstances, the return should outperform the returns achievable from a more conservative approach",
  },
];

const getResult = (score) => {
  if (score < 15) {
    return portfolioResults[0];
  } else if (score >= 15 && score < 20) {
    return portfolioResults[1];
  } else if (score >= 20 && score < 25) {
    return portfolioResults[2];
  } else if (score >= 25 && score < 30) {
    return portfolioResults[3];
  } else {
    return portfolioResults[4];
  }
};

class CalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.CALENDAR_CLIENT_ID,
      process.env.CALENDAR_CLIENT_SECRET,
      process.env.CALENDAR_REDIRECT_URL
    );
  }

  generateGMeetLink(sessionDetails, emailGroup) {
    const setCredentialsForOauth2 = () => {
      // if access token is expired then use refresh token to regenerate
      if (
        this.oauth2Client.credentials &&
        this.oauth2Client.credentials.expiry_date > Date.now()
      ) {
        //    const access_token = oauth2Client.credentials.access_token;
        generateCalendarEventWithMeet();
      } else {
        this.oauth2Client.setCredentials({
          refresh_token: process.env.CALENDAR_REFRESH_TOKEN,
        });
        this.oauth2Client.getAccessToken((err, token) => {
          if (err) return console.error("Error getting access token:", err);
          generateCalendarEventWithMeet(token);
        });
      }
    };

    const generateCalendarEventWithMeet = () => {
      // generate link and return the link
      const {
        _id,
        title,
        description,
        scheduledTimeStamp: { date, fromTime, toTime },
      } = sessionDetails;

      const getSessionStart = DateTimeService.getMergeDateAndTimeString(
        date.toISOString(),
        DateTimeService.getISOStringFromTime(
          DateTimeService.get24HrTime(fromTime)
        )
      );

      const getSessionEnd = DateTimeService.getMergeDateAndTimeString(
        date.toISOString(),
        DateTimeService.getISOStringFromTime(
          DateTimeService.get24HrTime(toTime)
        )
      );

      const calendar = google.calendar({
        version: "v3",
        auth: this.oauth2Client,
      });
      const event = {
        summary: title,
        location: "Virtual / Google Meet",
        description: description,
        start: {
          dateTime: getSessionStart,
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: getSessionEnd,
          timeZone: "Asia/Kolkata",
        },
        attendees: emailGroup,
        reminders: {
          useDefault: false,
          // testing
          overrides: [
            { method: "email", minutes: 5 * 60 },
            { method: "email", minutes: 60 },
            // { method: "email", minutes: 2 },
            { method: "popup", minutes: 10 },
            // { method: "popup", minutes: 1 },
          ],
        },
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
            requestId: "coding-calendar-demo",
          },
        },
      };

      calendar.events.insert(
        {
          calendarId: "primary",
          resource: event,
          conferenceDataVersion: 1,
        },
        (err, res) => {
          if (err) return console.error(err);
          console.log("Event created", res.data.htmlLink);
          console.log("Google Meet Link", res.data.hangoutLink);
          //   notifying the creator of the event
          this.notifyCreator(_id, res.data.hangoutLink);
        }
      );
    };

    setCredentialsForOauth2();
  }

  generateGMeetLinkForAdvisors(requestDetails, emailGroup) {
    // format of emailGroup
    // [{email:xxx},{email:xxx}]
    const setCredentialsForOauth2 = () => {
      // if access token is expired then use refresh token to regenerate
      if (
        this.oauth2Client.credentials &&
        this.oauth2Client.credentials.expiry_date > Date.now()
      ) {
        //    const access_token = oauth2Client.credentials.access_token;
        generateEventWithMeetForAdvisor();
      } else {
        this.oauth2Client.setCredentials({
          refresh_token: process.env.CALENDAR_REFRESH_TOKEN,
        });
        this.oauth2Client.getAccessToken((err, token) => {
          if (err) return console.error("Error getting access token:", err);
          generateEventWithMeetForAdvisor(token);
        });
      }
    };

    const generateEventWithMeetForAdvisor = () => {
      const {
        scheduledDate,
        fromTime,
        toTime,
        investorVAR,
        investorIdealRisk,
        firstName,
        lastName,
        mobileNumber,
        email,
        questions,
        riskScores,
        advisorEmail,
        advisorName,
        investorId,
        advisorId
      } = requestDetails;

      const getSessionStart = `${scheduledDate}T${fromTime}:00`;

      const getSessionEnd = `${scheduledDate}T${toTime}:00`;

      const calendar = google.calendar({
        version: "v3",
        auth: this.oauth2Client,
      });
      const event = {
        summary: "Connect with our advisor",
        location: "Virtual / Google Meet",
        description:
          "In this you will be able to connect with one of our advisors to discuss your queries.",
        start: {
          dateTime: getSessionStart,
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: getSessionEnd,
          timeZone: "Asia/Kolkata",
        },
        attendees: emailGroup,
        reminders: {
          useDefault: false,
          // testing
          overrides: [
            { method: "email", minutes: 5 * 60 },
            { method: "email", minutes: 60 },
            // { method: "email", minutes: 2 },
            { method: "popup", minutes: 10 },
            // { method: "popup", minutes: 1 },
          ],
        },
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
            requestId: "coding-calendar-demo",
          },
        },
      };

      let ques = []
      if (questions.length) {
        questions.map(async (question) => {
          const q = await RiskQuestionsModel.findById(question.questionID)
          const searchObject = q.options.find((option) => option.value == question.selectedOptionValue);
          ques.push({ question: q.question, answer: searchObject.text })
        }
        )
      }
      calendar.events.insert(
        {
          calendarId: "primary",
          resource: event,
          conferenceDataVersion: 1,
        },
        async (err, res) => {
          if (err) return console.error(err);
          console.log("Event created", res.data.htmlLink);
          console.log("Google Meet Link", res.data.hangoutLink);
          //   notifying the emailGroup of the event
          const mailTemplateForInvestor = {
            subject: "Connect with our advisor",
            body: `
              <html>
                <body>
                  <p>Dear User,</p>
                  <p>We are pleased to inform you that you have been scheduled for a session with one of our advisors.
                  <h2> Advisor Details: </h2>
                  <h3> Name: ${advisorName}</h3>
                  <h3> Email: ${advisorEmail}</h3>
                  <h2> Session Details: </h2>
                  <h3> Date: ${DateTimeService.getLocalDate(scheduledDate)}</h3>
                  <h3> Time: ${DateTimeService.get12HrTime(
              fromTime
            )} - ${DateTimeService.get12HrTime(toTime)}</h3>
                  <h3> Session Link: ${res.data.hangoutLink} </h3>
                  <p>We look forward to your session and appreciate your contribution.</p>
                  <p>Sincerely,<br>PredictRAM Team</p>
                </body>
              </html>`,
          };
          const notifyInvestor = await EmailService.sendCustomisedEmail(
            email,
            mailTemplateForInvestor.subject,
            mailTemplateForInvestor.body
          );
          if (notifyInvestor) {
            const adminEmail = advisorEmail;
            const mailTemplateForAdmin = {
              subject: "New Connection Request",
              body: `
                <html>
                  <body>
                    <p>Dear Admin,</p>
                    <p>We are pleased to inform you that a new connection request has been made.
                    <h2> Investor Details: </h2>
                    <h3> Name: ${firstName} ${lastName}</h3>
                    ${investorVAR ? `<h3> Portfolio VAR: ${investorVAR}</h3>` : ``}
                    ${investorIdealRisk ? `<h3> Ideal Risk: ${investorIdealRisk}</h3>` : ``}
                    ${riskScores && `<h3> Risk Capacity: ${getResult(riskScores.riskCapacity).status}</h3>
                    <h3> Risk Tolerance: ${getResult(riskScores.riskTolerance).status}</h3>
                    <h3> Risk Profile: ${getResult(riskScores.riskProfile).status}</h3>`}
                    ${ques.length ? `<h3> Risk Questions and answers: </h3>
                    <ol>
                    ${ques?.map((q) => {
                return `<li>
                      <h3>Question:</h3> ${q.question}
                      <h3>Answer:</h3> ${q.answer}
                      </li>`
              }).join('')}
                    </ol>`: `<br />`}
                    <br />
                    <br />
                    <h2> Session Details: </h2>
                    <h3> Date: ${DateTimeService.getLocalDate(
                scheduledDate
              )}</h3>
                          <h3> Time: ${DateTimeService.get12HrTime(
                fromTime
              )} - ${DateTimeService.get12HrTime(toTime)}</h3>
                    <h3> Session Link: ${res.data.hangoutLink} </h3>
                    <p>We look forward to your session and appreciate your contribution.</p>
                    <p>Sincerely,<br>PredictRAM Team</p>
                  </body>
                </html>`,
            };
            const notifyAdmin = await EmailService.sendCustomisedEmail(
              adminEmail,
              mailTemplateForAdmin.subject,
              mailTemplateForAdmin.body
            );

            // Save the session to the database
            const session = new adviceSession({
              bookedBy: investorId,
              bookedFor: advisorId,
              sessionLink: res.data.hangoutLink,
              schedule: {
                date: new Date(scheduledDate),
                time: fromTime
              }
            });

            const savedSession = await session.save();

            return notifyAdmin;
          }
        }
      );
    };
    setCredentialsForOauth2();
  }

  async notifyCreator(sessionId, sessionLink) {
    try {
      const sessionDetails = await Session.findById(sessionId).populate(
        "instructor",
        "email"
      );

      if (sessionDetails) {
        const creatorEmail = sessionDetails.instructor.email;
        const subjectOfEmail = "Reminder for your upcoming session";

        const {
          title,
          scheduledTimeStamp: { date, fromTime, toTime },
        } = sessionDetails;

        const emailTemplate = EmailService.generateEmailTemplateCreator(
          title,
          date,
          fromTime,
          toTime,
          sessionLink
        );

        const notifyingCreator = await EmailService.sendCustomisedEmail(
          creatorEmail,
          subjectOfEmail,
          emailTemplate
        );

        console.log("Instructor Notified Successfully");
      } else {
        console.error("Instructor Details not found");
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new CalendarService();
