const express = require("express");
const mongoose = require("mongoose");
const User = require("../../models/users");
const Event = require("../../models/events");
const ResearchPaper = require("../../models/research");
const PortfolioScore = require("../../models/portfolioScore");
const json2xls = require("json2xls");
const fs = require("fs");
const { ObjectId } = mongoose.Schema.Types;

const app = express();

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.wdfuc.mongodb.net/interns?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const userSubmittedPaper = async (id, eventStartDate) => {
  // console.log(id);
  const data = await ResearchPaper.countDocuments({
    userId: id,
    //createdAt: { $gte: eventStartDate },
  });
  return data;
};

const getCurrentBatchEvents = async (fromDate) => {
  const data = await Event.find({
    startdate: { $gte: fromDate },
  });
  return { count: data.length, events: data.map((d) => d?._id) };
};

const objectIdWithTimestamp = (timestamp) => {
  if (typeof timestamp == "string") {
    timestamp = new Date(timestamp);
  }
  var hexSeconds = Math.floor(timestamp / 1000).toString(16);
  var constructedObjectId = mongoose.Types.ObjectId(
    hexSeconds + "0000000000000000"
  );

  return constructedObjectId;
};

const getUsers = async (fromDate, toDate) => {
  const users = await User.find(
    {
      // _id: {
      //   $gte: objectIdWithTimestamp(new Date(fromDate)),
      //   $lte: objectIdWithTimestamp(new Date(toDate)),
      // },
      createdAt: { $gte: fromDate, $lte: toDate },
    },
    { name: 1, email: 1, createdAt: 1 }
  );
  return users;
};

const saveInFile = (data) => {
  try {
    var xls = json2xls(data);
    fs.writeFileSync("01_Oct_2024(createdAt).xlsx", xls, "binary");
    console.log("complete...");
  } catch (err) {
    console.error(err);
  }
};

const getEmailFromJsonAndFindUser = async (eventStartDate) => {
  try {
    const json = fs.readFileSync("csvjson3.json");
    const emails = JSON.parse(json).map((obj) => {
      if (obj?.Email != null && obj?.Email.includes("@")) {
        return obj?.Email;
      }
    });
    const users = (
      await User.find(
        { email: { $in: emails } },
        { name: 1, email: 1, createdAt: 1 }
      )
    ).filter(async (user) => {
      const event = await Event.exists({
        "subscriber._id": user._id,
        createdAt: { $gte: eventStartDate },
      });
      return event;
    });

    return users;
  } catch (err) {
    console.error(err);
  }
};

const getPortfolioScore = async (userId, events) => {
  try {
    const aggregateQuery = [
      {
        $match: {
          userId: userId,
          // eventId: { $in: events },
        },
      },
      {
        $group: {
          _id: "$userId",
          total: { $sum: "$portfolioScore" },
        },
      },
    ];

    const [data] = await PortfolioScore.aggregate(aggregateQuery);

    // console.log(total);

    return data?.total || 0;
  } catch (err) {
    console.error(err);
  }
};

const getPerticipationPercent = async (fromDate, toDate, eventStartDate) => {
  try {
    console.log(fromDate, toDate, eventStartDate);
    const perticipationData = [];
    const users = await getUsers(fromDate, toDate);
    // const users = await getEmailFromJsonAndFindUser(eventStartDate);
    // console.log(users);
    const { events, count: eventCount } = await getCurrentBatchEvents(
      eventStartDate
    );
    for (let user of users) {
      const paperCount = await userSubmittedPaper(user._id, eventStartDate);
      const portfolioScore = await getPortfolioScore(user._id, events);
      const obj = {
        name: user.name,
        email: user.email,
        paperCount: paperCount,
        eventCount: eventCount,
        perticipationPercentage: Number(
          ((paperCount / eventCount) * 100)?.toFixed(0)
        ),
        portfolioScore,
      };
      //console.log(obj);
      perticipationData.push(obj);
    }
    perticipationData.sort(function (a, b) {
      return (
        parseFloat(b.perticipationPercentage) -
        parseFloat(a.perticipationPercentage)
      );
    });

    saveInFile(perticipationData);
  } catch (err) {
    console.error(err);
  }
};

const resetParticipationForNovemberUsers = async (year) => {
  try {
    console.log(
      `Resetting participation for users registered in November ${year}`
    );

    // Define the date range for November of the specified year
    const novemberStartDate = new Date(year, 10, 1); // November 1st (Month is 0-indexed)
    const novemberEndDate = new Date(year, 11, 0); // November 30th
    console.log(novemberStartDate);
    console.log(novemberEndDate);

    // Fetch users who registered in November
    const novemberUsers = await getUsersByRegistrationDate(
      novemberStartDate,
      novemberEndDate
    );

    console.log(
      `Found ${novemberUsers.length} users registered in November ${year}`
    );

    // for (let user of novemberUsers) {
    //   // Reset user's participation data
    //   await resetUserParticipation(user._id);
    // }

    // console.log(`Participation reset completed for November ${year}`);
  } catch (err) {
    console.error(`Error resetting participation for November ${year}:`, err);
  }
};

const getUsersByRegistrationDate = async (startDate, endDate) => {
  return await User.find({
    createdAt: { $gte: startDate, $lte: endDate }, // Filter by registration date
  });
};

const resetUserParticipation = async (userId) => {
  // Update participation records for the user
  await Participation.updateMany(
    { userId }, // Filter by user ID
    {
      $set: {
        paperCount: 0,
        perticipationPercentage: 0,
        portfolioScore: 0,
      },
    }
  );
};

app.listen(8081, () => {
  console.log("Server started on port 8080.");
  //getEmailFromJsonAndFindUser();
  getPerticipationPercent(
    new Date("2024-10-01"),
    new Date("2024-11-30"),
    new Date("2024-10-01")
  );
  // resetParticipationForNovemberUsers(2024);
});
