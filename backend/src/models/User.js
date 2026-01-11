const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId; // Password is required only if googleId is not present
            },
            minlength: 6,
            select: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Allows multiple null/missing values
        },
        picture: String,
        role: {
            type: String,
            enum: ['Admin', 'Organizer', 'Vendor', 'Attendee'],
            default: 'Attendee',
        },
        phone: String,
        location: String,
        profileImage: String,

        // Role-specific fields can be added here or in separate models if they grow too large
        organizationName: String, // For Organizer/Vendor
        skills: [String], // For Vendor

        verified: {
            type: Boolean,
            default: true,
        },
        verificationToken: String,
        verificationTokenExpire: Date,
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// Generate and hash verification token
const crypto = require('crypto');
userSchema.methods.getVerificationToken = function () {
    // Generate token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to verificationToken field
    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // Set expire (e.g., 24 hours)
    this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

    return verificationToken;
};

module.exports = mongoose.model('User', userSchema);
