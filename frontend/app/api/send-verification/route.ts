import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { storeVerificationCode } from "../verify-email/route";

// Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "np03cs4a230270@heraldcollege.edu.np",
    pass: process.env.GMAIL_PASSWORD || "ybgx bhkk yvqd ikaf",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Generate and store verification code
    const verificationCode = storeVerificationCode(email);

    // Prepare email content
    const verificationLink = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/verify?email=${encodeURIComponent(email)}&code=${verificationCode}`;

    const mailOptions = {
      from: process.env.GMAIL_USER || "np03cs4a230270@heraldcollege.edu.np",
      to: email,
      subject: "Verify Your Email - Event Management System",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
              .code-text { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: monospace; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
                <p>Event Management System</p>
              </div>
              <div class="content">
                <h2>Welcome!</h2>
                <p>Thank you for signing up. Please verify your email address to activate your account.</p>
                
                <div class="code-box">
                  <p>Your verification code:</p>
                  <div class="code-text">${verificationCode}</div>
                  <p style="color: #999; font-size: 14px;">Valid for 24 hours</p>
                </div>

                <p>Or click the button below to verify:</p>
                <center>
                  <a href="${verificationLink}" class="button">Verify Email</a>
                </center>

                <p style="margin-top: 30px; color: #666;">
                  If you didn't sign up for this account, you can ignore this email.
                </p>

                <div class="footer">
                  <p>© 2025 Event Management System. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Send verification email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent successfully",
        verificationCode, // For demo/testing purposes
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      {
        error: "Failed to send verification email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
