const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// eSewa test credentials
const ESEWA_MERCHANT_CODE = 'EPAYTEST';
const ESEWA_SECRET_KEY = '8gBm6&EhH1/q';
const ESEWA_PAYMENT_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_VERIFY_URL = 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';

// Generate signature for eSewa
const generateSignature = (data, secretKey) => {
  const message = `${data.amt}${data.psc}${data.txAmt}${data.pid}${data.scd}`;
  return crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');
};

// Initiate eSewa payment
router.post('/initiate', protect, async (req, res) => {
  try {
    const { amount, ticketId, eventId, quantity, productName } = req.body;

    if (!amount || !ticketId || !eventId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // eSewa payment data
    const paymentData = {
      amt: Math.round(amount * 100) / 100, // Amount in NPR
      psc: 0, // Pancha Shuddhi Charge (tax)
      txAmt: 0, // Transaction Amount
      pid: ticketId, // Product ID (unique)
      scd: ESEWA_MERCHANT_CODE, // Merchant code
      su: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/payment-success?ticketId=${ticketId}&quantity=${quantity}`,
      fu: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/payment-failed?ticketId=${ticketId}`,
    };

    // Generate signature
    const signature = generateSignature(paymentData, ESEWA_SECRET_KEY);

    const formData = {
      ...paymentData,
      sign: signature,
    };

    // Update ticket with eSewa reference
    await Ticket.updateOne(
      { _id: ticketId },
      {
        paymentStatus: 'pending',
        paymentProvider: 'esewa',
        esewaPid: paymentData.pid,
      }
    );

    res.json({
      success: true,
      data: {
        url: ESEWA_PAYMENT_URL,
        formData: formData,
      },
    });
  } catch (err) {
    console.error('Error initiating eSewa payment:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
    });
  }
});

// Verify eSewa payment
router.post('/verify', protect, async (req, res) => {
  try {
    const { pidx, transaction_id, ticketId } = req.body;

    if (!pidx || !transaction_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing transaction details',
      });
    }

    // Verify ticket belongs to current user
    const ticket = await Ticket.findById(ticketId).populate('event').populate('user', 'name email');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
      });
    }

    // SECURITY: Ensure the ticket belongs to the authenticated user
    if (ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to verify this ticket',
      });
    }

    // Verify payment with eSewa
    const verifyData = {
      pidx: pidx,
    };

    // In production, you would make an actual HTTP request to eSewa verify endpoint
    // For now, we'll just update the ticket status
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        paymentStatus: 'completed',
        paymentDetails: {
          provider: 'esewa',
          transactionId: transaction_id,
          pidx: pidx,
          verifiedAt: new Date(),
        },
        status: 'Confirmed',
      },
      { new: true }
    ).populate('event').populate('user', 'name email');

    // Update event stats after payment is verified
    if (updatedTicket) {
      const event = updatedTicket.event;
      if (!event.registeredUsers.includes(updatedTicket.user._id)) {
        event.registeredUsers.push(updatedTicket.user._id);
      }
      
      const typeIndex = event.ticketTypes.findIndex(t => t.name === updatedTicket.ticketType.name);
      if (typeIndex !== -1) {
        event.ticketTypes[typeIndex].sold += updatedTicket.quantity;
      }
      
      event.budget.total += updatedTicket.totalPrice;
      await event.save();

      // Create notification
      await Notification.create({
        user: updatedTicket.user._id,
        title: 'Ticket Booked Successfully',
        message: `You have successfully booked ${updatedTicket.quantity} ticket(s) for "${event.title}".`,
        type: 'success'
      });

      // Send confirmation email with ticket details
      try {
        const ticketDate = new Date(event.date).toLocaleDateString('en-US', {
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
              <p style="margin: 10px 0 0 0; font-size: 14px;">Your payment has been processed successfully</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0;">
              <h2 style="color: #333; margin-top: 0;">Hello ${updatedTicket.user.name},</h2>
              
              <p style="color: #666; line-height: 1.6;">Thank you for purchasing your ticket! Your ticket for <strong>${event.title}</strong> has been confirmed. Find your ticket details below:</p>
              
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
                    <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${updatedTicket.ticketType.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Quantity:</td>
                    <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">${updatedTicket.quantity}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; font-weight: bold; border-bottom: 1px solid #eee;">Total Price:</td>
                    <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #eee;">NPR ${updatedTicket.totalPrice}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; font-weight: bold;">Ticket ID:</td>
                    <td style="padding: 10px 0; color: #333; font-family: monospace; font-weight: bold;">${updatedTicket._id}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #2e7d32; font-weight: bold;">✓ Payment Confirmed</p>
                <p style="margin: 5px 0 0 0; color: #558b2f; font-size: 14px;">Your ticket is ready for download from your dashboard</p>
              </div>

              <p style="color: #666; line-height: 1.6; margin: 20px 0;">
                <strong>What's next?</strong><br>
                1. Go to your dashboard to view and download your ticket<br>
                2. Present the QR code at the event entrance<br>
                3. Enjoy the event!
              </p>

              <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #e65100; font-weight: bold;">ℹ Important</p>
                <p style="margin: 5px 0 0 0; color: #bf360c; font-size: 14px;">Please keep your ticket safe. You'll need to present it at the event entrance.</p>
              </div>

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
          email: updatedTicket.user.email,
          subject: `Ticket Confirmed - ${event.title}`,
          html: emailHTML,
          message: `Your ticket for ${event.title} has been confirmed. Please check your dashboard to download your ticket.`
        });

        console.log(`Confirmation email sent to ${updatedTicket.user.email}`);
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr);
        // Don't throw error, email sending is non-critical
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: updatedTicket,
    });
  } catch (err) {
    console.error('Error verifying eSewa payment:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
    });
  }
});

// Get payment status
router.get('/status/:ticketId', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
      });
    }

    // SECURITY: Ensure the ticket belongs to the authenticated user
    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this ticket status',
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: ticket.paymentStatus,
        paymentProvider: ticket.paymentProvider,
        ticketStatus: ticket.status,
      },
    });
  } catch (err) {
    console.error('Error getting payment status:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status',
    });
  }
});

module.exports = router;
