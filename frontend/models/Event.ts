import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  organizer: string;
  image?: string;
  capacity: number;
  registeredUsers: string[];
  ticketTypes: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide an event date'],
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide an event location'],
    },
    category: {
      type: String,
      enum: ['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'],
      default: 'Other',
    },
    organizer: {
      type: String,
      required: true,
    },
    image: String,
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    registeredUsers: [
      {
        type: String,
        ref: 'User',
      },
    ],
    ticketTypes: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
