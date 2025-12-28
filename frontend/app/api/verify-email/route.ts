import { NextRequest, NextResponse } from "next/server";

// In-memory storage for verification codes (in production, use database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json(
        { error: "Missing code or email" },
        { status: 400 }
      );
    }

    // Check if verification code exists and is valid
    const stored = verificationCodes.get(email);
    if (!stored) {
      return NextResponse.json(
        { error: "Verification code not found or expired" },
        { status: 400 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return NextResponse.json(
        { error: "Verification code expired" },
        { status: 400 }
      );
    }

    // Remove the code after successful verification
    verificationCodes.delete(email);

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}

// Helper function to store verification code (called from signup)
export function storeVerificationCode(email: string): string {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  verificationCodes.set(email, {
    code,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  return code;
}

// Helper function to get stored code
export function getVerificationCode(email: string): string | null {
  const stored = verificationCodes.get(email);
  if (!stored) return null;
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return null;
  }
  return stored.code;
}
