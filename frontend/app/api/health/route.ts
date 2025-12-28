import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json(
      {
        success: true,
        message: 'MongoDB connection successful!',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'MongoDB connection failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
