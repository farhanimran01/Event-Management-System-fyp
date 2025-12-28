const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide an event title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide an event description'],
        },
        date: {
            type: Date,
            required: [true, 'Please provide an event date'],
        },
        time: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: [true, 'Please provide an event location'],
        },
        category: {
            type: String,
            enum: ['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'],
            default: 'Other',
        },
        organizer: {
            type: String,
            required: true,
        },
        image: String,
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        registeredUsers: [
            {
                type: String,
                ref: 'User',
            },
        ],
        ticketTypes: [
            {
                name: String,
                price: Number,
                quantity: Number,
            },
        ],
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
        agenda: [
            {
                title: String,
                startTime: Date,
                endTime: Date,
                description: String,
                speaker: String,
            }
        ],
        backupPlans: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
