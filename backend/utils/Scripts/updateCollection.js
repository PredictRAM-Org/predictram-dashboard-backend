const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const portfolioScore = require("../../models/portfolioScore");
const research = require("../../models/research");
const Users = require("../../models/users");

const app = express();

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.wdfuc.mongodb.net/interns?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const updateUsersSecret = async () => {
  const batchSize = 20;
  const sleepTime = 5000;
  let skipCount = 0;

  while (true) {
    const usersWithNoSecrets = await Users.find({
      secret_token: { $exists: false },
    })
      .limit(batchSize)
      .skip(skipCount)
      .lean();

    if (usersWithNoSecrets.length === 0) {
      break;
    }

    usersWithNoSecrets.forEach(async (user) => {
      const secret_token = await bcrypt.hash(user.email, 10);
      const updatedUserWithSecrets = await Users.findByIdAndUpdate(
        user._id,
        { secret_token },
        { new: true }
      );
      console.log(`User updated with name: ${user.name}`);
    });

    await new Promise((resolve) => setTimeout(resolve, sleepTime));
  }
};

updateUsersSecret();

// research.updateMany({}, { isVerified: true }, (error, result) => {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log(`Successfully updated collection.`);
//   }
// });

// Start the Express app
app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
