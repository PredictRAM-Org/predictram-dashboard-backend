const AttemptTracker = require("../models/attemptTracker");

exports.getAttemptTracker = async (req, res) => {
  try {
    const attemptTracker = await AttemptTracker.findOne({
      userId: req.params.userId,
    });
    if (attemptTracker?.remainingTries === undefined) {
      throw new Error("User has not applied for the free trial");
    }

    if (attemptTracker?.remainingTries > 0) {
      res.apiResponse(
        true,
        "Remaining Attempts fetched Successfully",
        attemptTracker
      );
    } else {
      throw new Error("No remaining tries. Please contact support");
    }
  } catch (err) {
    res.apiResponse(
      false,
      err.message || "Error while fetching remaining attempts",
      err
    );
  }
};

exports.createAttemptTracker = async (req, res) => {
  try {
    const newAttemptTracker = new AttemptTracker({
      userId: req.body.userId,
      remainingTries: req.body.remainingTries,
    });
    const savedAttemptTracker = await newAttemptTracker.save();
    res.apiResponse(
      true,
      "Attempt Tracker Created Successfully",
      savedAttemptTracker
    );
  } catch (err) {
    res.apiResponse(false, err.message, err);
  }
};

exports.updateAttemptTracker = async (req, res) => {
  try {
    const attemptTracker = await AttemptTracker.findOne({
      userId: req.params.userId,
    });
    if (attemptTracker.remainingTries > 0) {
      attemptTracker.remainingTries -= 1;
      await attemptTracker.save();
      res.apiResponse(
        true,
        "Remaining Attempts updated Successfully",
        attemptTracker
      );
    } else {
      res.apiResponse(false, "No remaining tries. Please contact support");
    }
  } catch (err) {
    res.apiResponse(false, err.message, err);
  }
};

exports.restoreAttempts = async (req, res) => {
  try {
    const attemptTracker = await AttemptTracker.findOne({
      userId: req.params.userId,
    });
    attemptTracker.remainingTries = 30;
    await attemptTracker.save();
    res.apiResponse(
      true,
      "Remaining Attempts updated Successfully",
      attemptTracker
    );
  } catch (err) {
    res.apiResponse(false, err.message, err);
  }
};
