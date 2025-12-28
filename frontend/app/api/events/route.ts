import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import { NextRequest, NextResponse } from 'next/server';

// Demo events fallback data
const DEMO_EVENTS = [
  {
    _id: '1',
    title: 'Tech Conference 2025',
    description: 'Annual technology conference featuring keynote speakers and workshops',
    date: new Date('2025-03-15'),
    time: '09:00',
    location: 'San Francisco, CA',
    category: 'technology',
    organizer: 'TechHub',
    capacity: 500,
    registeredUsers: [],
    ticketTypes: [{ name: 'General', price: 99, quantity: 500 }],
    status: 'upcoming',
  },
  {
    _id: '2',
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React and Next.js',
    date: new Date('2025-02-20'),
    time: '14:00',
    location: 'New York, NY',
    category: 'education',
    organizer: 'DevLearning',
    capacity: 100,
    registeredUsers: [],
    ticketTypes: [{ name: 'Standard', price: 49, quantity: 100 }],
    status: 'upcoming',
  },
  {
    _id: '3',
    title: 'Startup Networking Event',
    description: 'Connect with founders, investors, and entrepreneurs',
    date: new Date('2025-02-10'),
    time: '18:00',
    location: 'Austin, TX',
    category: 'networking',
    organizer: 'StartupHub',
    capacity: 200,
    registeredUsers: [],
    ticketTypes: [{ name: 'VIP', price: 199, quantity: 50 }, { name: 'General', price: 79, quantity: 150 }],
    status: 'upcoming',
  },
];

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find();
    return NextResponse.json(events, { status: 200 });
  } catch (error: any) {
    console.warn('MongoDB connection failed, returning demo events:', error.message);
    // Return demo events when database is unavailable
    return NextResponse.json(DEMO_EVENTS, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { title, description, date, time, location, category, organizer, capacity, ticketTypes } =
      await req.json();

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      organizer,
      capacity,
      ticketTypes,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
