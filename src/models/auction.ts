import mongoose, { Document, Schema } from 'mongoose';

export interface IAuction extends Document {
  ordinalId: string;
  startingPrice: number;
  currentPrice: number;
  minBidIncrement: number;
  startTime: Date;
  endTime: Date;
  sellerAddress: string;
  highestBidder?: string;
  status: 'pending' | 'active' | 'ended' | 'cancelled';
  bids: Array<{
    bidderAddress: string;
    amount: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const auctionSchema = new Schema<IAuction>(
  {
    ordinalId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0
    },
    minBidIncrement: {
      type: Number,
      required: true,
      min: 0
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
    highestBidder: {
      type: String,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'ended', 'cancelled'],
      default: 'pending',
      index: true
    },
    bids: [{
      bidderAddress: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Indexes
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ sellerAddress: 1, status: 1 });
auctionSchema.index({ highestBidder: 1, status: 1 });

export const Auction = mongoose.model<IAuction>('Auction', auctionSchema); 