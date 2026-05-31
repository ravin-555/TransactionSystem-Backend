import mongoose from 'mongoose';

const idempotencySchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        response: {
            type: Object,
            required: true
        },

        statusCode: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

// Optional: auto-delete after 24 hours
idempotencySchema.index(
    { createdAt: 1 },
    {key:1,userId:1 }, // Compound index to ensure uniqueness per user causes MongoDB to create a unique index on the combination of key and userId, ensuring that each user can only use a specific idempotency key once. This prevents conflicts between different users using the same key.
    {unique: true },
    { expireAfterSeconds: 60 * 60 * 24 }
);

export const idempotencyKey= mongoose.models.idempotencyKey || mongoose.model('idempotencykey',idempotencySchema);
