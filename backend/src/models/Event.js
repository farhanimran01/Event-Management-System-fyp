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
            required: [true, 'Please select an event category'],
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
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
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        waitlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Ticket Types Definition
        ticketTypes: [
            {
                name: String,
                price: Number,
                quantity: Number,
                sold: { type: Number, default: 0 },
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

        // --- Branching & Lineage ---
        isBranch: {
            type: Boolean,
            default: false,
        },
        parentEvent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            default: null,
        },
        branchName: {
            type: String, // e.g., "Rainy Day Plan", "Budget Cut Version"
            default: null,
        },
        lineage: [
            {
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                modifiedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                action: String, // "CREATED", "BRANCHED", "UPDATED"
                note: String,
            }
        ],

        // --- Budget & Vendors ---
        budget: {
            limit: { type: Number, default: 0 },
            total: { type: Number, default: 0 }, // Revenue from ticket sales
            expenses: [
                {
                    title: String,
                    amount: Number,
                    category: String,
                }
            ]
        },
        vendors: [
            {
                vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assuming Vendor is a User role
                role: String, // e.g., "Catering", "Sound"
                status: { type: String, enum: ['Pending', 'Confirmed', 'Declined'], default: 'Pending' }
            }
        ],
        tasks: [
            {
                title: String,
                description: String,
                assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                deadline: Date,
                status: { type: String, enum: ['Pending', 'In-Progress', 'Completed'], default: 'Pending' }
            }
        ]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Cascade delete branches if parent is deleted? 
// For now, let's keep them but maybe mark as orphaned or handle in controller.

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
