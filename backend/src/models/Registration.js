const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            ref: 'Event',
        },
        userId: {
            type: String,
            required: true,
            ref: 'User',
        },
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        ticketType: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['registered', 'confirmed', 'cancelled'],
            default: 'registered',
        },
        registrationDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
