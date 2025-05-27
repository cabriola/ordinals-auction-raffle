import { Request, Response } from 'express';
import { Raffle } from '../models/raffle';
import { logger } from '../utils/logger';

export const createRaffle = async (req: Request, res: Response) => {
  try {
    const {
      ordinalId,
      ticketPrice,
      maxTickets,
      startTime,
      endTime,
      sellerAddress
    } = req.body;

    const raffle = new Raffle({
      ordinalId,
      ticketPrice,
      maxTickets,
      startTime,
      endTime,
      sellerAddress,
      status: 'pending'
    });

    await raffle.save();

    logger.info('New raffle created:', { raffleId: raffle._id });

    res.status(201).json({
      success: true,
      data: raffle
    });
  } catch (error) {
    logger.error('Error creating raffle:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create raffle',
        code: 'CREATE_RAFFLE_ERROR'
      }
    });
  }
};

export const getRaffle = async (req: Request, res: Response) => {
  try {
    const raffle = await Raffle.findById(req.params.id);
    
    if (!raffle) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Raffle not found',
          code: 'RAFFLE_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: raffle
    });
  } catch (error) {
    logger.error('Error fetching raffle:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch raffle',
        code: 'FETCH_RAFFLE_ERROR'
      }
    });
  }
};

export const getAllRaffles = async (req: Request, res: Response) => {
  try {
    const raffles = await Raffle.find({ status: 'active' });
    
    res.json({
      success: true,
      data: raffles
    });
  } catch (error) {
    logger.error('Error fetching raffles:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch raffles',
        code: 'FETCH_RAFFLES_ERROR'
      }
    });
  }
};

export const buyTicket = async (req: Request, res: Response) => {
  try {
    const { buyerAddress } = req.body;
    const raffle = await Raffle.findById(req.params.id);

    if (!raffle) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Raffle not found',
          code: 'RAFFLE_NOT_FOUND'
        }
      });
    }

    if (raffle.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Raffle is not active',
          code: 'RAFFLE_NOT_ACTIVE'
        }
      });
    }

    if (raffle.tickets.length >= raffle.maxTickets) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'All tickets have been sold',
          code: 'RAFFLE_SOLD_OUT'
        }
      });
    }

    const ticketNumber = raffle.tickets.length + 1;
    raffle.tickets.push({
      buyerAddress,
      ticketNumber,
      purchaseTime: new Date()
    });

    await raffle.save();

    logger.info('New ticket purchased:', {
      raffleId: raffle._id,
      buyerAddress,
      ticketNumber
    });

    res.json({
      success: true,
      data: {
        raffle,
        ticketNumber
      }
    });
  } catch (error) {
    logger.error('Error buying ticket:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to buy ticket',
        code: 'BUY_TICKET_ERROR'
      }
    });
  }
};

export const drawWinner = async (req: Request, res: Response) => {
  try {
    const raffle = await Raffle.findById(req.params.id);

    if (!raffle) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Raffle not found',
          code: 'RAFFLE_NOT_FOUND'
        }
      });
    }

    if (raffle.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Raffle is not active',
          code: 'RAFFLE_NOT_ACTIVE'
        }
      });
    }

    if (raffle.tickets.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No tickets have been sold',
          code: 'NO_TICKETS_SOLD'
        }
      });
    }

    // Randomly select a winner
    const randomIndex = Math.floor(Math.random() * raffle.tickets.length);
    const winner = raffle.tickets[randomIndex].buyerAddress;

    raffle.winner = winner;
    raffle.status = 'ended';
    await raffle.save();

    logger.info('Raffle winner drawn:', {
      raffleId: raffle._id,
      winner
    });

    res.json({
      success: true,
      data: {
        raffle,
        winner
      }
    });
  } catch (error) {
    logger.error('Error drawing winner:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to draw winner',
        code: 'DRAW_WINNER_ERROR'
      }
    });
  }
}; 