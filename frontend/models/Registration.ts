import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  eventId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  status: 'registered' | 'confirmed' | 'cancelled';
  registrationDate: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    eventId: {
      type: String,
      required: true,
      ref: 'Event',
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    ticketType: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'cancelled'],
      default: 'registered',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Registration || mongoose.model<IRegistration>('Registration', registrationSchema);
