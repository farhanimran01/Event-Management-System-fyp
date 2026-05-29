const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema(
    {
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Organizer ID is required']
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            sparse: true // Allow anonymous contact
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event ID is required']
        },
        userEmail: {
            type: String,
            required: [true, 'User email is required']
        },
        userPhone: String,
        message: {
            type: String,
            required: [true, 'Message is required']
        },
        contactMethod: {
            type: String,
            enum: ['phone', 'email'],
            default: 'email'
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ContactInquiry', contactInquirySchema);
