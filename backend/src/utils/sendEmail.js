const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Check if email credentials are configured
        const emailUser = process.env.SMTP_USER || process.env.GMAIL_USER;
        const emailPass = process.env.SMTP_PASS || process.env.GMAIL_PASSWORD;
        
        if (!emailUser || !emailPass) {
            console.warn('[EMAIL] Email credentials not configured in environment variables. Email sending disabled.');
            console.warn('[EMAIL] Set SMTP_USER and SMTP_PASS (or GMAIL_USER and GMAIL_PASSWORD) in .env file');
            return { skipped: true, reason: 'Email credentials not configured' };
        }

        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE || 'gmail',
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });

        const message = {
            from: `${process.env.FROM_NAME || 'Event Management System'} <${emailUser}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        console.log(`[EMAIL] Sending email to ${options.email} with subject: ${options.subject}`);
        const info = await transporter.sendMail(message);
        console.log(`[EMAIL] Message sent successfully: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[EMAIL] Error sending email:', err.message);
        throw err;
    }
};

module.exports = sendEmail;
