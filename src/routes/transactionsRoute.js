import express from 'express';
import auth from '../middleware/auth.js';
import { deposit,withdraw ,transfer, getTransactionHistory} from '../controllers/transactionsController.js';
import { catchAsync } from "../utils/asyncHandler.js";
import { idempotencyMiddleware } from '../middleware/Idempotency.js';
import { authorizeAdmin } from '../middleware/authorization.js';
import { reverseTransaction } from '../controllers/transactionsController.js';

const router = express.Router();

router.post('/deposit', auth, catchAsync(deposit));
router.post('/withdraw', auth, catchAsync(withdraw));
router.post('/transfer',auth, idempotencyMiddleware, catchAsync(transfer));
router.get('/history',auth,catchAsync(getTransactionHistory));

 
export default router; 
