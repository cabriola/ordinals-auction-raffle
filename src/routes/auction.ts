import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import {
  createAuction,
  getAuction,
  getAllAuctions,
  placeBid,
  endAuction
} from '../controllers/auction';

const router = Router();

// Get all auctions
router.get('/', getAllAuctions);

// Get auction by ID
router.get(
  '/:id',
  param('id').isMongoId(),
  validateRequest,
  getAuction
);

// Create new auction
router.post(
  '/',
  [
    body('ordinalId').isString().notEmpty(),
    body('startingPrice').isNumeric().isFloat({ min: 0 }),
    body('minBidIncrement').isNumeric().isFloat({ min: 0 }),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('sellerAddress').isEthereumAddress()
  ],
  validateRequest,
  createAuction
);

// Place bid
router.post(
  '/:id/bid',
  [
    param('id').isMongoId(),
    body('bidderAddress').isEthereumAddress(),
    body('amount').isNumeric().isFloat({ min: 0 })
  ],
  validateRequest,
  placeBid
);

// End auction
router.post(
  '/:id/end',
  param('id').isMongoId(),
  validateRequest,
  endAuction
);

export default router; 