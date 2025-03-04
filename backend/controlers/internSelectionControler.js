const Users = require("../models/users");
const EmailService = require("../services/EmailService");
const QueryFilter = require("../utils/QueryFilter");

const queryFilter = new QueryFilter();

const internApproval = async (req, res, next) => {
  try {
    const { mail, name, userId } = req.body;
    queryFilter.validateObjectId(userId);

    const mailSubject = "PredictRAM internship update";
    const mailBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PredictRAM Internship Program</title>
  </head>
  <body>
    <p>Dear Interns,</p>

    <p>
      I hope this email finds you well. First and foremost, I would like to
      extend my heartfelt congratulations on your selection for the Risk and
      Asset Management Training Program. Your selection reflects your dedication
      and potential in the field, and I have no doubt that this program will be
      instrumental in fostering your growth in the financial industry.
    </p>

    <p>
      To officially commence your journey in the program, we kindly request you
      to generate and download the training offer letter from the following
      link:
    </p>

    <a href="https://pdf.ac/1LXWjb">Download Offer Letter</a>

    <p>The password for this form is: oct@2023</p>
    <p>
      The password is in all lowercase. Please do not share this link with
      anyone.
    </p>
    <p>
      We request you to please read and preview all the terms and conditions
      before submitting. Your submission to this agreement is considered your
      acceptance.
    </p>

    <p>
      It is important to note that your submission of this form will serve as
      your formal acceptance of the agreement, confirming your participation in
      the Risk and Asset Management Training Program.
    </p>

    <p>
      If you have any questions or require any assistance with the offer letter
      or any other aspect of the program, please do not hesitate to reach out to
      our dedicated support team.
    </p>

    <p>
      Once again, congratulations on this remarkable achievement, and we look
      forward to having you on board as part of our training program. Your
      future in the financial industry holds great promise, and we are excited
      to be a part of your journey.
    </p>

    <p>
      Generating Offer letter & Agreement are absolutely FREE. No need to pay
      anything.
    </p>

    <p>
      NOTE: Do not publish or post this agreement on social networking websites.
    </p>

    <p>Thank you, and best regards,</p>
    <p>Predictram Team.</p>
  </body>
</html>
`;

    const sendingMail = await EmailService.sendCustomisedEmail(
      mail,
      mailSubject,
      mailBody
    );

    const premiumExpiryDate = new Date();
    premiumExpiryDate.setMonth(premiumExpiryDate.getMonth() + 6);

    const updatingUser = await Users.findByIdAndUpdate(userId, {
      status: "APPROVED",
      role: "USER",
      payment: {
        premiumUser: true,
        expiry: premiumExpiryDate.toISOString(),
      },
    });
    res.apiResponse(true, "Mail Sent Successfully");
  } catch (error) {
    res.apiResponse(false, error?.message, error);
  }
};

const internRejection = async (req, res, next) => {
  try {
    const { mail, name, userId } = req.body;
    queryFilter.validateObjectId(userId);

    const mailSubject = "PredictRAM internship update";
    const mailBody = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internship Application Update</title>
</head>
<body>
    <p>Dear ${name},</p>

    <p>I hope this message finds you well. I wanted to provide you with an update on your recent application for the internship program with PredictRAM.</p>

    <p>After a thorough evaluation of the report you submitted, we regret to inform you that your application has not been selected for the internship program. The assessment revealed that your report did not meet the expected benchmarks, and we believe that additional training and preparation would be beneficial for your professional growth.</p>

    <p>However, we firmly believe that this setback should not be the end of your journey with us. We are committed to supporting your career aspirations and would like to offer you an alternative opportunity. You can consider starting with our paid plan, which is available at a competitive rate of INR 249 per month. By subscribing to this plan, you will gain access to a range of premium benefits, including:</p>

    <ul>
        <li>
            <strong>Access to Resources:</strong> You will receive free access to our comprehensive dashboard, providing you with valuable tools for submitting research reports, conducting data analysis, and more.
        </li>
        <li>
            <strong>NISM Research Analyst Module:</strong> We are dedicated to helping you clear the NISM (National Institute of Securities Markets) Research Analyst module. You will receive comprehensive study materials, access to recording sessions, and detailed notes to ensure you are well-prepared for this crucial step in your career.
        </li>
        <li>
            <strong>Client Interaction and Data Analytics:</strong> You will undergo training in effective client interaction and data analytics, skills that are essential for success in the financial industry and will set you up for a rewarding career.
        </li>
        <li>
            <strong>Company Management Conferences:</strong> We will guide you on attending company management conferences after the announcement of results. This experience will teach you how to ask insightful questions to top management, providing you with valuable insights into the industry.
        </li>
        <li>
            <strong>Asset Management Across All Asset Classes:</strong> Our program will equip you with knowledge and skills needed to manage assets across various asset classes, including equity, derivatives, commodities, bonds, ETFs, mutual funds, interest rate futures, currencies, and digital assets. This comprehensive training will give you a well-rounded understanding of asset management.
        </li>
        <li>
            <strong>Real Client Portfolio Management:</strong> Once you successfully clear your NISM exams, you will be assigned real client portfolios to manage. This hands-on experience will be instrumental in your career development and provide you with a unique opportunity to apply your skills in a real-world setting.
        </li>
    </ul>

    <p>We believe that this paid plan will provide you with the training and tools necessary to enhance your professional abilities and potentially reapply for our internship program in the future.</p>

    <p>If you are interested in this alternative opportunity or have any questions, please do not hesitate to reach out to us. We remain committed to your growth and success in the financial industry.</p>

    <p>Thank you for considering PredictRAM as part of your career journey, and we look forward to the possibility of working together in the future.</p>

    <p>Best regards,</p>
    <p>--<br>Sincerely<br>Subir Singh</p>

    <p><em>PredictRAM (a unit of Params Data Provider Pvt Ltd)<br>Corporate Office: B1/639 A, Janakpuri, New Delhi, Delhi 110058, India</em></p>

    <p><em>Confidentiality: This message has been sent as a part of the discussion between PredictRAM and the addressee whose name is specified above. Should you receive this message by mistake, we would be most grateful if you informed us that the message has been sent to you. In this case, we also ask that you delete this message from your mailbox, and do not forward it or any part of it to anyone else.</em></p>
</body>
</html>
`;

    const sendingMail = await EmailService.sendCustomisedEmail(
      mail,
      mailSubject,
      mailBody
    );
    const updatingUser = await Users.findByIdAndUpdate(userId, {
      status: "REJECTED",
    });
    res.apiResponse(true, "Mail Sent Successfully");
  } catch (error) {
    res.apiResponse(false, error?.message, error);
  }
};

module.exports = {
  internApproval,
  internRejection,
};
