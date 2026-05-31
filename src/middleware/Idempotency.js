import { idempotencyKey } from '../models/IdempotencyKey.js';
import AppError from "../utils/AppError.js";

// Prevents duplicate transaction execution
export const idempotencyMiddleware = async (req, res, next) => {
    console.log(req.headers)
    const key = req.headers['idempotency-key']

    // If no key → reject (important for financial routes) 
    if (!key) {
        console.log('Idempotency-Key header is missing');
        throw new AppError(400, 'Idempotency-Key header is required', 'IDEMPOTENCY_KEY_MISSING');
    }
    // Try to create a new record with the key. If it already exists, it will throw an error due to the unique index.
    try {
        await idempotencyKey.create({
            key,
            userId: req.user.id,
            response: { message: 'Processing' },
            statusCode: 202
        });
        // Store key temporarily in request
        req.idempotencyKey = key;
        next();

    } catch (err) {

        //   Check if key already exists for this user
        const existing = await idempotencyKey.findOne({
            key,
            userId: req.user.id
        });

        // If request already processed → return stored response
        if (existing) {
            console.log('Idempotency-Key already used');
            throw new AppError(existing.statusCode || 200, "Duplicate request", "IDEMPOTENCY_KEY_DUPLICATE", { response: existing.response });
        }
        // If error is due to duplicate key, it means another request is being processed with the same key
        if (err.code === 11000) {
            console.log('Idempotency-Key is currently being processed');
            throw new AppError(409, "Request is currently being processed", "IDEMPOTENCY_KEY_PROCESSING");
        }
        // For other errors, return a generic error response
        console.error('Error processing idempotency key:', err);
        throw new AppError(500, "Internal Server Error", "IDEMPOTENCY_KEY_ERROR", { details: err.message });
    }

};
