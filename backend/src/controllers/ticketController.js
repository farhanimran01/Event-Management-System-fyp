const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const QRCode = require('qrcode');

// @desc    Book a ticket
// @route   POST /api/tickets
// @access  Private (Attendee)
exports.bookTicket = async (req, res, next) => {
    try {
        const { eventId, ticketTypeName } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // --- PREVENT DUPLICATE BOOKING ---
        const existingTicket = await Ticket.findOne({ event: eventId, user: req.user.id });
        if (existingTicket) {
            return res.status(400).json({ success: false, error: 'You have already booked a ticket for this event' });
        }

        // Check if event is full
        let isWaitlisted = false;
        if (event.registeredUsers.length >= event.capacity) {
            isWaitlisted = true;
        }

        // Find ticket type (if specified, otherwise default to first)
        let ticketType;
        if (ticketTypeName) {
            ticketType = event.ticketTypes.find(t => t.name === ticketTypeName);
        } else {
            ticketType = event.ticketTypes[0];
        }

        if (!ticketType) {
            return res.status(404).json({ success: false, error: 'Ticket type not found' });
        }

        // Check availability of specific ticket type if not waitlisting
        if (!isWaitlisted && ticketType.sold >= ticketType.quantity) {
            isWaitlisted = true;
        }

        if (isWaitlisted) {
            // Add to waitlist
            if (!event.waitlist.includes(req.user.id)) {
                event.waitlist.push(req.user.id);
                await event.save();
            }

            // Create notification
            await Notification.create({
                user: req.user.id,
                title: 'Added to Waitlist',
                message: `The event "${event.title}" is full. You have been added to the waitlist.`,
                type: 'warning'
            });

            return res.status(200).json({
                success: true,
                message: 'Event is full. You have been added to the waitlist.',
                isWaitlisted: true
            });
        }

        // Generate QR Code Data (Full URL for check-in)
        const ticketId = new mongoose.Types.ObjectId();
        const qrDataString = JSON.stringify({
            ticketId: ticketId.toString(),
            userId: req.user.id,
            eventId: eventId
        });
        const qrCodeDataUrl = await QRCode.toDataURL(qrDataString);

        // Create Ticket
        const ticket = await Ticket.create({
            _id: ticketId,
            event: eventId,
            user: req.user.id,
            ticketType: {
                name: ticketType.name,
                price: ticketType.price
            },
            paymentStatus: 'paid', // Simulate payment for now
            qrCode: qrCodeDataUrl
        });

        // Update Event Stats
        event.registeredUsers.push(req.user.id);
        const typeIndex = event.ticketTypes.findIndex(t => t.name === ticketType.name);
        event.ticketTypes[typeIndex].sold += 1;

        // Update Budget (Income)
        event.budget.total += ticketType.price;

        await event.save();

        // Create notification
        await Notification.create({
            user: req.user.id,
            title: 'Ticket Booked Successfully',
            message: `You have successfully booked a ticket for "${event.title}".`,
            type: 'success'
        });

        res.status(201).json({
            success: true,
            data: ticket
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get my tickets
// @route   GET /api/tickets/me
// @access  Private
exports.getMyTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id }).populate('event', 'title date location image');

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get tickets for an event (Organizer)
// @route   GET /api/events/:eventId/tickets
// @access  Private (Organizer)
exports.getEventTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.find({ event: req.params.eventId }).populate('user', 'name email');

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Check-in ticket
// @route   POST /api/tickets/checkin
// @access  Private (Organizer)
exports.checkIn = async (req, res, next) => {
    try {
        const { qrCodeData } = req.body;

        if (!qrCodeData) {
            return res.status(400).json({ success: false, error: 'Please provide QR code data' });
        }

        let parsedData;
        try {
            parsedData = JSON.parse(qrCodeData);
        } catch (e) {
            return res.status(400).json({ success: false, error: 'Invalid QR code data' });
        }

        const ticket = await Ticket.findById(parsedData.ticketId).populate('event', 'title');

        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }

        // Security Check: Verify QR data matches ticket record
        if (ticket.user.toString() !== parsedData.userId || ticket.event._id.toString() !== parsedData.eventId) {
            return res.status(400).json({ success: false, error: 'Security breach: QR Data mismatch detected' });
        }

        if (ticket.checkedIn) {
            return res.status(400).json({ success: false, error: 'Admission denied: Ticket already scanned' });
        }

        ticket.checkedIn = true;
        ticket.checkInTime = Date.now();
        await ticket.save();

        // Notify Attendee of successful entry
        await Notification.create({
            user: ticket.user,
            title: 'Welcome to the Event!',
            message: `You have successfully checked in to "${ticket.event.title}". Enjoy your experience!`,
            type: 'success'
        });

        res.status(200).json({
            success: true,
            message: 'Attendee checked in successfully',
            data: ticket
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get check-in status
// @route   GET /api/tickets/checkin/:ticketId
// @access  Private
exports.getCheckInStatus = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);

        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }

        // Ensure user is authorized
        if (ticket.user.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            checkedIn: ticket.checkedIn,
            checkInTime: ticket.checkInTime
        });
    } catch (err) {
        next(err);
    }
};

