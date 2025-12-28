const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
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
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
        },
        ticketType: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['valid', 'used', 'cancelled'],
            default: 'valid',
        },
        qrCode: String,
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
