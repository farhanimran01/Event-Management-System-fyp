import { connectDB } from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const registrations = await Registration.find();
    return NextResponse.json({ success: true, data: registrations }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { eventId, userId, fullName, email, phone, ticketType, quantity, totalPrice } =
      await req.json();

    const registration = await Registration.create({
      eventId,
      userId,
      fullName,
      email,
      phone,
      ticketType,
      quantity,
      totalPrice,
    });

    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
