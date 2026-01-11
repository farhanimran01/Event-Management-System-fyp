const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating between 1 and 5'],
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: [true, 'Please provide a comment'],
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from submitting more than one feedback per event
feedbackSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
