const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        businessName: {
            type: String,
            required: true,
        },
        serviceType: {
            type: String,
            required: true, // e.g., Catering, Sound, Logistics
        },
        description: String,
        resources: [
            {
                name: String,
                quantity: Number,
                unitPrice: Number,
            }
        ],
        contracts: [
            {
                event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
                status: { type: String, enum: ['Draft', 'Signed', 'Completed'], default: 'Draft' },
                amount: Number,
                terms: String,
                dateSigned: Date
            }
        ],
        pastEvents: [
            {
                event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
                rating: Number,
                feedback: String,
            }
        ]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
