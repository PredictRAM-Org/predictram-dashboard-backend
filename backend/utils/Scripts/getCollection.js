const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
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

Users.find({}, { name: 1, email: 1 }, (error, result) => {
  if (error) {
    console.error(error);
  } else {
    fs.writeFile("users.txt", result.toString(), (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Data written to file successfully");
      }
    });
  }
});

// Start the Express app
app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
