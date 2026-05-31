// this is used for reversing the transaction by admin in frauds
import mongoose from 'mongoose';
import {Transaction} from '../models/transactions.js';
import {User} from '../models/User.js';
import AppError from '../utils/AppError.js';

export const reversalService = async (adminId, transactionId) => {
    console.log(`adminid=${adminId} , transactionid=${transactionId}`);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user=await User.findById(adminId);
        if(user.role!=="admin") throw new AppError(403, "Forbidden", "FORBIDDEN");
        
        // 1. Fetch original transaction
        const tx = await Transaction.findById(transactionId).session(session);

        if (!tx) {
            throw new AppError(404, "Transaction not found", "TRANSACTION_NOT_FOUND");
        }

        if (tx.type === 'reversal') {
            throw new AppError(400, "Cannot reverse a reversal", "REVERSAL_INVALID");
        }

        // 2. Prevent double reversal
        const alreadyReversed = await Transaction.findOne({
            relatedTransaction: tx._id,
            type: 'reversal'
        }).session(session);

        if (alreadyReversed) {
            throw new AppError(400, "Transaction already reversed", "REVERSAL_ALREADY_REVERSED");
        }

        // 3. Reverse balances
        if (tx.type === 'transfer') {
            await User.updateOne(
                { accountNumber: tx.toAccount },
                { $inc: { balance: -tx.amount } },
                { session }
            );

            await User.updateOne(
                { _id: tx.initiatedAccount },
                { $inc: { balance: tx.amount } },
                { session }
            );
        }
        // delete the previous transaction
        const deleted=await Transaction.findByIdAndDelete(tx._id).session(session);
        
        const reversaluser = await User.findOne({accountNumber: tx.toAccount}).session(session);
        const afterbalance= reversaluser.balance - tx.amount;

        // 4. Create reversal transaction
        const reversal = await Transaction.create([{
            amount: tx.amount,
            type: 'reversal',
            initiatedAccount: reversaluser._id, // transaction reversed so the initiator also reverses from reciever to sender
            toAccount: tx.fromAccount,
            fromAccount: tx.toAccount,
            balancebefore: reversaluser.balance,
            balanceafter: afterbalance,
            relatedTransaction: tx._id
        }], { session });

        await session.commitTransaction();
        session.endSession();

// 5. Return reversal details which is used in controller to save in idempotency key collection and also send response to client
        return ({
            status: 200,
            reversalTransactionId: reversal[0]._id,
        })  ;

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(err.statusCode || 500, err.message || 'Transaction reversal failed', err.errorCode || 'REVERSAL_FAILED');
    }
}
