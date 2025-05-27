import mongoose, { Document, Schema } from 'mongoose';

export interface IRaffle extends Document {
  ordinalId: string;
  ticketPrice: number;
  maxTickets: number;
  startTime: Date;
  endTime: Date;
  sellerAddress: string;
  status: 'pending' | 'active' | 'ended' | 'cancelled';
  tickets: Array<{
    buyerAddress: string;
    ticketNumber: number;
    purchaseTime: Date;
  }>;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

const raffleSchema = new Schema<IRaffle>(
  {
    ordinalId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0
    },
    maxTickets: {
      type: Number,
      required: true,
      min: 1
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    sellerAddress: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'ended', 'cancelled'],
      default: 'pending',
      index: true
    },
    tickets: [{
      buyerAddress: {
        type: String,
        required: true
      },
      ticketNumber: {
        type: Number,
        required: true,
        min: 1
      },
      purchaseTime: {
        type: Date,
        default: Date.now
      }
    }],
    winner: {
      type: String,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
raffleSchema.index({ status: 1, endTime: 1 });
raffleSchema.index({ sellerAddress: 1, status: 1 });
raffleSchema.index({ 'tickets.buyerAddress': 1 });

export const Raffle = mongoose.model<IRaffle>('Raffle', raffleSchema); 