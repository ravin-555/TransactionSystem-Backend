import express from "express"
import auth from "../middleware/auth.js"
import { getTransactionHistory , reverseTransaction } from "../controllers/transactionsController.js"
import { catchAsync } from "../utils/asyncHandler.js"
import { idempotencyMiddleware } from "../middleware/Idempotency.js"
import { authorizeAdmin } from "../middleware/authorization.js"

const router= express.Router();

router.get('/transactions/history', auth, authorizeAdmin, catchAsync(getTransactionHistory));

// api/admin/transaction/:id/reverse
router.post('/transactions/:id/reverse', auth, authorizeAdmin, idempotencyMiddleware, catchAsync(reverseTransaction));

export default router;