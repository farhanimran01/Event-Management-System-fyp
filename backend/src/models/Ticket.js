const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
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
        ticketType: {
            name: { type: String, required: true },
            price: { type: Number, required: true },
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentId: {
            type: String,
        },
        qrCode: {
            type: String, // Store the QR code string or URL
            required: true,
            unique: true,
        },
        checkedIn: {
            type: Boolean,
            default: false,
        },
        checkInTime: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate booking for same event/user? 
// Maybe allow multiple tickets but unique QR codes.

module.exports = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
