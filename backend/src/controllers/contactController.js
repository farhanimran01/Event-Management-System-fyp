const ContactInquiry = require('../models/ContactInquiry');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Create contact inquiry for organizer
// @route   POST /api/contact/organizer
// @access  Public/Private
exports.createContactInquiry = async (req, res, next) => {
    try {
        const { organizerId, eventId, userEmail, userPhone, message, contactMethod } = req.body;

        // Validate required fields
        if (!organizerId || !eventId || !userEmail || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please provide organizerId, eventId, userEmail, and message'
            });
        }

        // Verify organizer exists
        const organizer = await User.findById(organizerId);
        if (!organizer) {
            return res.status(404).json({
                success: false,
                error: 'Organizer not found'
            });
        }

        // Verify event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        // Create inquiry
        const contactInquiry = await ContactInquiry.create({
            organizerId,
            userId: req.user?.id || null,
            eventId,
            userEmail,
            userPhone: userPhone || null,
            message,
            contactMethod: contactMethod || 'email'
        });

        console.log('✓ Contact inquiry created:', {
            organizerId,
            eventId,
            userEmail,
            contactMethod: contactMethod || 'email'
        });

        res.status(201).json({
            success: true,
            message: 'Contact inquiry submitted successfully',
            data: contactInquiry
        });
    } catch (err) {
        console.error('❌ CREATE CONTACT ERROR:', err);
        next(err);
    }
};

// @desc    Get organizer's contact inquiries
// @route   GET /api/contact/inquiries
// @access  Private (Organizer/Admin)
exports.getContactInquiries = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const organizerId = req.user.id;

        const inquiries = await ContactInquiry.find({ organizerId })
            .populate('eventId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (err) {
        console.error('❌ GET INQUIRIES ERROR:', err);
        next(err);
    }
};

// @desc    Mark inquiry as read
// @route   PUT /api/contact/inquiries/:id/read
// @access  Private (Organizer/Admin)
exports.markAsRead = async (req, res, next) => {
    try {
        const inquiry = await ContactInquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                error: 'Inquiry not found'
            });
        }

        // Verify ownership
        if (inquiry.organizerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this inquiry'
            });
        }

        inquiry.read = true;
        await inquiry.save();

        res.status(200).json({
            success: true,
            message: 'Inquiry marked as read',
            data: inquiry
        });
    } catch (err) {
        console.error('❌ MARK READ ERROR:', err);
        next(err);
    }
};

// @desc    Delete contact inquiry
// @route   DELETE /api/contact/inquiries/:id
// @access  Private (Organizer/Admin)
exports.deleteInquiry = async (req, res, next) => {
    try {
        const inquiry = await ContactInquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                error: 'Inquiry not found'
            });
        }

        // Verify ownership
        if (inquiry.organizerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this inquiry'
            });
        }

        await ContactInquiry.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Inquiry deleted successfully'
        });
    } catch (err) {
        console.error('❌ DELETE INQUIRY ERROR:', err);
        next(err);
    }
};
