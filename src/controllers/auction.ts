import { Request, Response } from 'express';
import { Auction } from '../models/auction';
import { logger } from '../utils/logger';

export const createAuction = async (req: Request, res: Response) => {
  try {
    const {
      ordinalId,
      startingPrice,
      minBidIncrement,
      startTime,
      endTime,
      sellerAddress
    } = req.body;

    const auction = new Auction({
      ordinalId,
      startingPrice,
      currentPrice: startingPrice,
      minBidIncrement,
      startTime,
      endTime,
      sellerAddress,
      status: 'pending'
    });

    await auction.save();

    logger.info('New auction created:', { auctionId: auction._id });

    res.status(201).json({
      success: true,
      data: auction
    });
  } catch (error) {
    logger.error('Error creating auction:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create auction',
        code: 'CREATE_AUCTION_ERROR'
      }
    });
  }
};

export const getAuction = async (req: Request, res: Response) => {
  try {
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    logger.error('Error fetching auction:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch auction',
        code: 'FETCH_AUCTION_ERROR'
      }
    });
  }
};

export const getAllAuctions = async (req: Request, res: Response) => {
  try {
    const auctions = await Auction.find({ status: 'active' });
    
    res.json({
      success: true,
      data: auctions
    });
  } catch (error) {
    logger.error('Error fetching auctions:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch auctions',
        code: 'FETCH_AUCTIONS_ERROR'
      }
    });
  }
};

export const placeBid = async (req: Request, res: Response) => {
  try {
    const { bidderAddress, amount } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction is not active',
          code: 'AUCTION_NOT_ACTIVE'
        }
      });
    }

    if (amount <= auction.currentPrice) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Bid must be higher than current price',
          code: 'INVALID_BID_AMOUNT'
        }
      });
    }

    if (amount < auction.currentPrice + auction.minBidIncrement) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Bid must be at least ${auction.minBidIncrement} higher than current price`,
          code: 'INVALID_BID_INCREMENT'
        }
      });
    }

    auction.currentPrice = amount;
    auction.highestBidder = bidderAddress;
    auction.bids.push({
      bidderAddress,
      amount,
      timestamp: new Date()
    });

    await auction.save();

    logger.info('New bid placed:', {
      auctionId: auction._id,
      bidderAddress,
      amount
    });

    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    logger.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to place bid',
        code: 'PLACE_BID_ERROR'
      }
    });
  }
};

export const endAuction = async (req: Request, res: Response) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction is not active',
          code: 'AUCTION_NOT_ACTIVE'
        }
      });
    }

    auction.status = 'ended';
    await auction.save();

    logger.info('Auction ended:', { auctionId: auction._id });

    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    logger.error('Error ending auction:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to end auction',
        code: 'END_AUCTION_ERROR'
      }
    });
  }
}; 