const express = require("express");
const mongoose = require("mongoose");
const portfolioScore = require("../../models/portfolioScore");

const app = express();

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.wdfuc.mongodb.net/interns?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Update all research papers to set isVerified to true
portfolioScore.deleteMany({}, (error, result) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Successfully deleted everything.`);
  }
});

// Start the Express app
app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
