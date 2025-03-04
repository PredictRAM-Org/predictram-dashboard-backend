const mongoose = require('mongoose');

const AttemptTrackerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    remainingTries: {
        type: Number,
        required: true
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AttemptTracker', AttemptTrackerSchema);