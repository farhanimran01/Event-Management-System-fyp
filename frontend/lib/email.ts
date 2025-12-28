import nodemailer from 'nodemailer';

// Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'np03cs4a230270@heraldcollege.edu.np',
    pass: process.env.GMAIL_APP_PASSWORD || 'ybgx bhkk yvqd ikaf', // App-specific password
  },
});

export async function sendVerificationEmail(email: string, verificationCode: string) {
  try {
    const verificationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify?code=${verificationCode}&email=${email}`;

    const mailOptions = {
      from: process.env.GMAIL_USER || 'np03cs4a230270@heraldcollege.edu.np',
      to: email,
      subject: 'Verify Your EventHub Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to EventHub!</h2>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>

          <p>Or copy this verification code: <strong>${verificationCode}</strong></p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', result.response);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || 'np03cs4a230270@heraldcollege.edu.np',
      to: email,
      subject: 'Welcome to EventHub - Account Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome ${name}!</h2>
          <p>Your email has been verified successfully. You can now access all EventHub features.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-radius: 5px;">
            <h3 style="color: #1e40af;">Get Started:</h3>
            <ul>
              <li>Browse upcoming events</li>
              <li>Register for events</li>
              <li>Manage your tickets</li>
              <li>Create your own events</li>
            </ul>
          </div>

          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.response);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export default transporter;
