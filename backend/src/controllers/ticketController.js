const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const QRCode = require('qrcode');
const sendEmail = require('../utils/sendEmail');

// @desc    Book a ticket
// @route   POST /api/tickets
// @access  Private (Attendee)
exports.bookTicket = async (req, res, next) => {
    try {
        const { eventId, ticketTypeName, quantity = 1, paymentMethod = 'esewa' } = req.body;

        // Validate payment method
        const validPaymentMethods = ['esewa', 'stripe', 'paypal', 'cash'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({ success: false, error: 'Invalid payment method' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
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

        // Calculate total price
        const totalPrice = ticketType.price * quantity;

        // Create Ticket with correct user and payment method
        const ticket = await Ticket.create({
            _id: ticketId,
            event: eventId,
            user: req.user.id,
            ticketType: {
                name: ticketType.name,
                price: ticketType.price
            },
            quantity: quantity,
            totalPrice: totalPrice,
            paymentStatus: 'pending', // Always pending until confirmed
            paymentProvider: paymentMethod, // Set to actual payment method selected by user
            qrCode: qrCodeDataUrl,
            status: 'Pending'
        });

        // Populate user info for email
        const ticketWithUser = await Ticket.findById(ticketId).populate('user', 'name email').populate('event');

        // Send initial booking email
        try {
            const ticketDate = new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const statusText = paymentMethod === 'cash' 
                ? 'Pending - Awaiting confirmation' 
                : 'Awaiting Payment Confirmation';

            const emailHTML = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 28px;">Ticket Booking Confirmation</h1>
                  <p style="margin: 10px 0 0 0; font-size: 14px;">Your ticket has been reserved</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0;">
                  <h2 style="color: #333; margin-top: 0;">Hello ${ticketWithUser.user.name},</h2>
                  
                  <p style="color: #666; line-height: 1.6;">Thank you for booking your ticket! Your ticket for <strong>${event.title}</strong> has been reserved. Find your ticket details below:</p>
                  
                  <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #667eea; margin-top: 0;">Event Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Event:</td>
                        <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${event.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Date & Time:</td>
                        <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${ticketDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Location:</td>
                        <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${event.location}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Ticket Type:</td>
                        <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${ticket.ticketType.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Quantity:</td>
                        <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${quantity}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Total Price:</td>
                        <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">NPR ${totalPrice}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Ticket ID:</td>
                        <td style="padding: 10px 0; color: #333; font-family: monospace; font-weight: bold;">${ticket._id}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #1565c0; font-weight: bold;">⏳ Status: ${statusText}</p>
                    <p style="margin: 5px 0 0 0; color: #0d47a1; font-size: 14px;">
                      ${paymentMethod === 'cash' 
                        ? 'Your ticket is pending. The organizer will confirm it after receiving payment.' 
                        : 'Please complete your payment to confirm this ticket.'}
                    </p>
                  </div>

                  <p style="color: #666; line-height: 1.6; margin: 20px 0;">
                    <strong>What's next?</strong><br>
                    ${paymentMethod === 'cash' 
                      ? '1. Pay the organizer in cash at the event<br>2. The organizer will confirm your ticket<br>3. Download your ticket from your dashboard<br>4. Present the QR code at the event entrance' 
                      : '1. Complete your online payment<br>2. Your ticket will be automatically confirmed<br>3. Download your ticket from your dashboard<br>4. Present the QR code at the event entrance'}
                  </p>

                  <p style="color: #999; font-size: 12px; margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    If you have any questions, please contact the event organizer or our support team.
                  </p>
                </div>

                <div style="background: #333; color: white; text-align: center; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px;">
                  <p style="margin: 0;">© 2024 Event Management System. All rights reserved.</p>
                </div>
              </div>
            `;

            await sendEmail({
                email: ticketWithUser.user.email,
                subject: `Ticket Booking Confirmed - ${event.title}`,
                html: emailHTML,
                message: `Your ticket for ${event.title} has been booked. Status: ${statusText}`
            });

            console.log(`[TICKET] Booking email sent to ${ticketWithUser.user.email}`);
        } catch (emailErr) {
            console.error('[TICKET] Error sending booking email:', emailErr.message);
            // Don't throw error, email sending is non-critical
        }

        // Update Event Stats (only when payment is completed - will be done in payment verification)
        // For now, just reserve the tickets
        // event.registeredUsers.push(req.user.id);
        // const typeIndex = event.ticketTypes.findIndex(t => t.name === ticketType.name);
        // event.ticketTypes[typeIndex].sold += quantity;
        // event.budget.total += totalPrice;
        // await event.save();

        res.status(201).json({
            success: true,
            data: ticket
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get my tickets
// @route   GET /api/tickets/my
// @access  Private
exports.getMyTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id })
            .populate('event', 'title date time location image description capacity ticketTypes');

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
// @route   GET /api/tickets/event/:eventId
// @access  Private (Organizer - must own the event, or Admin)
exports.getEventTickets = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        console.log(`[getEventTickets] Request from user ${req.user.id} (role: ${req.user.role}) for event ${eventId}`);

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            console.error(`[getEventTickets] Event ${eventId} not found`);
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        console.log(`[getEventTickets] Event organizer: ${event.organizer}, Request user: ${req.user.id}`);

        // Check ownership: organizer must own this event OR be admin
        if (req.user.role === 'Organizer') {
            // Ensure both IDs are strings for comparison
            const eventOrgId = event.organizer ? event.organizer.toString() : null;
            const userId = req.user.id.toString();
            
            if (eventOrgId !== userId) {
                console.error(`[getEventTickets] Authorization failed: Organizer ${userId} tried to access event owned by ${eventOrgId}`);
                return res.status(403).json({ 
                    success: false, 
                    error: 'Not authorized to access tickets for this event' 
                });
            }
        }

        // Fetch tickets for the event
        const tickets = await Ticket.find({ event: eventId }).populate('user', 'name email');

        console.log(`[getEventTickets] Successfully fetched ${tickets.length} tickets for event ${eventId}`);

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (err) {
        console.error(`[getEventTickets] Error:`, err);
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

// @desc    Update ticket payment status (Organizer)
// @route   PUT /api/tickets/:ticketId/payment-status
// @access  Private (Organizer)
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentStatus } = req.body;

        if (!paymentStatus) {
            return res.status(400).json({ success: false, error: 'Payment status is required' });
        }

        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({ success: false, error: 'Invalid payment status' });
        }

        const ticket = await Ticket.findById(req.params.ticketId)
            .populate('event', 'organizer title date location')
            .populate('user', 'name email');

        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }

        // Verify user is the organizer of the event
        if (ticket.event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this ticket' });
        }

        const oldStatus = ticket.paymentStatus;
        ticket.paymentStatus = paymentStatus;
        await ticket.save();

        // Notify user of payment status change
        const statusMessages = {
            'completed': 'Your payment has been confirmed!',
            'pending': 'Your payment is pending.',
            'failed': 'Your payment failed. Please contact support.',
            'refunded': 'Your payment has been refunded.'
        };

        await Notification.create({
            user: ticket.user,
            title: 'Payment Status Updated',
            message: statusMessages[paymentStatus] || 'Your payment status has been updated.',
            type: paymentStatus === 'completed' ? 'success' : 'info'
        });

        // Send email when status is updated to 'completed'
        if (paymentStatus === 'completed' && oldStatus !== 'completed') {
            try {
                const ticketDate = new Date(ticket.event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const emailHTML = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; font-size: 28px;">Ticket Confirmed!</h1>
                      <p style="margin: 10px 0 0 0; font-size: 14px;">Your payment has been confirmed</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0;">
                      <h2 style="color: #333; margin-top: 0;">Hello ${ticket.user.name},</h2>
                      
                      <p style="color: #666; line-height: 1.6;">Great news! Your payment for <strong>${ticket.event.title}</strong> has been confirmed by the organizer. Your ticket is now ready!</p>
                      
                      <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">Event Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Event:</td>
                            <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${ticket.event.title}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Date & Time:</td>
                            <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${ticketDate}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Location:</td>
                            <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${ticket.event.location}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; color: #666; font-weight: bold;">Ticket Type:</td>
                            <td style="padding: 10px 0; color: #333; font-family: monospace; font-weight: bold;">${ticket.ticketType.name}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #2e7d32; font-weight: bold;">✓ Payment Confirmed</p>
                        <p style="margin: 5px 0 0 0; color: #558b2f; font-size: 14px;">Your ticket is ready for download from your dashboard</p>
                      </div>

                      <p style="color: #666; line-height: 1.6; margin: 20px 0;">
                        <strong>Next steps:</strong><br>
                        1. Go to your dashboard to view and download your ticket<br>
                        2. Present the QR code at the event entrance<br>
                        3. Enjoy the event!
                      </p>

                      <p style="color: #999; font-size: 12px; margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        If you have any questions, please contact the event organizer or our support team.
                      </p>
                    </div>

                    <div style="background: #333; color: white; text-align: center; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px;">
                      <p style="margin: 0;">© 2024 Event Management System. All rights reserved.</p>
                    </div>
                  </div>
                `;

                await sendEmail({
                    email: ticket.user.email,
                    subject: `Payment Confirmed - ${ticket.event.title}`,
                    html: emailHTML,
                    message: `Your payment for ${ticket.event.title} has been confirmed. Your ticket is ready!`
                });

                console.log(`[PAYMENT] Confirmation email sent to ${ticket.user.email}`);
            } catch (emailErr) {
                console.error('[PAYMENT] Error sending confirmation email:', emailErr.message);
                // Don't throw error, email sending is non-critical
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: ticket
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a ticket (Organizer only)
// @route   DELETE /api/tickets/:ticketId
// @access  Private (Organizer/Admin)
exports.deleteTicket = async (req, res, next) => {
    try {
        console.log('Delete ticket requested:', {
            ticketId: req.params.ticketId,
            userId: req.user.id,
            userRole: req.user.role
        });

        const ticket = await Ticket.findById(req.params.ticketId).populate('event', 'organizer title');

        if (!ticket) {
            console.log('Ticket not found:', req.params.ticketId);
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }

        console.log('Ticket found:', {
            ticketId: ticket._id,
            eventOrganizer: ticket.event.organizer.toString(),
            currentUserId: req.user.id
        });

        // Verify user is the organizer of the event
        if (ticket.event.organizer.toString() !== req.user.id) {
            console.log('Authorization failed - user is not the event organizer');
            return res.status(403).json({ success: false, error: 'Not authorized to delete this ticket' });
        }

        const eventId = ticket.event._id;
        const userId = ticket.user;

        // Delete the ticket
        await Ticket.findByIdAndDelete(req.params.ticketId);
        console.log('Ticket deleted from database');

        // Update event registeredUsers count
        await Event.findByIdAndUpdate(eventId, {
            $pull: { registeredUsers: userId }
        });
        console.log('Event updated - user removed from registeredUsers');

        // Notify user that their ticket was deleted
        await Notification.create({
            user: userId,
            title: 'Ticket Cancelled',
            message: `Your ticket for ${ticket.event.title} has been cancelled by the organizer.`,
            type: 'warning'
        });
        console.log('Notification created for user');

        res.status(200).json({
            success: true,
            message: 'Ticket deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting ticket:', err);
        next(err);
    }
};

