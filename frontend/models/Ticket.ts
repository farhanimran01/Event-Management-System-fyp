import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  eventId: string;
  userId: string;
  ticketNumber: string;
  ticketType: string;
  price: number;
  status: 'valid' | 'used' | 'cancelled';
  qrCode?: string;
  purchaseDate: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
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
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ticketType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['valid', 'used', 'cancelled'],
      default: 'valid',
    },
    qrCode: String,
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', ticketSchema);
