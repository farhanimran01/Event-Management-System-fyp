import { connectDB } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const tickets = await Ticket.find();
    return NextResponse.json({ success: true, data: tickets }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { eventId, userId, ticketType, price } = await req.json();

    // Generate unique ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const ticket = await Ticket.create({
      eventId,
      userId,
      ticketNumber,
      ticketType,
      price,
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
