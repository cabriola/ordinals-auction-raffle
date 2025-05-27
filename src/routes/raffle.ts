import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import {
  createRaffle,
  getRaffle,
  getAllRaffles,
  buyTicket,
  drawWinner
} from '../controllers/raffle';

const router = Router();

// Get all raffles
router.get('/', getAllRaffles);

// Get raffle by ID
router.get(
  '/:id',
  param('id').isMongoId(),
  validateRequest,
  getRaffle
);

// Create new raffle
router.post(
  '/',
  [
    body('ordinalId').isString().notEmpty(),
    body('ticketPrice').isNumeric().isFloat({ min: 0 }),
    body('maxTickets').isNumeric().isInt({ min: 1 }),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('sellerAddress').isEthereumAddress()
  ],
  validateRequest,
  createRaffle
);

// Buy ticket
router.post(
  '/:id/ticket',
  [
    param('id').isMongoId(),
    body('buyerAddress').isEthereumAddress()
  ],
  validateRequest,
  buyTicket
);

// Draw winner
router.post(
  '/:id/draw',
  param('id').isMongoId(),
  validateRequest,
  drawWinner
);

export default router; 