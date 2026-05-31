import mongoose from "mongoose";
import { Transaction } from "../models/transactions.js";
import { User } from "../models/User.js";
import AppError from "../utils/AppError.js"

export const transferService=async (fromUserId,amount,toAccountNumber) => {
    console.log("Transfer Service called with:", fromUserId, amount, toAccountNumber);
    // const { amount, toAccountNumber } = data;
    const userid= fromUserId ;
    const transferAmount = Number(amount); // because the amt is sent as string
    console.log("Here:",transferAmount, toAccountNumber) 


    //strat session
    const session = await mongoose.startSession();
    const transaction = session.startTransaction();
    try {
        // validate amount
        if (transferAmount < 0 || isNaN(transferAmount)) {
            throw new AppError(400, 'Invalid transfer amount', 'VALIDATION_FAILED');
            
        }

        // Fetch sender adding session within
        const sender = await User.findById(userid).session(session)
        console.log(userid)
        console.log(sender._id)
        //validate sender
        if (!sender) throw new AppError(404, "Sender account not found", "AUTH_NO_USER");
        // very important otherwise datbase fails
        if (sender.accountNumber === toAccountNumber) throw new AppError(400, "Can't transfer to same account", "TRANSFER_INVALID_ACCOUNT");
        const before = sender.balance;
        if (before < transferAmount) throw new AppError(400, "Insufficient Balance", "TRANSFER_INSUFFICIENT_BALANCE");

        // fetch receiver and adding session within
        const receiver = await User.findOne({ accountNumber: toAccountNumber }).session(session);
        if (!receiver) throw new AppError(404, "Receiver account not found", "TRANSFER_INVALID_ACCOUNT");

        if(receiver.role=="admin") throw new AppError(403, "Forbidden to transfer to admin account", "TRANSFER_FORBIDDEN_ACCOUNT");

        // Apply balance updates
        sender.balance -= transferAmount // decrease balance from sender account
        receiver.balance += transferAmount // increase balance to receiver account

        await sender.save({ session })  /* this will create ... balance:100 , session:{session}
        for both users          */
        await receiver.save({ session })

        // update method

        console.log("Sender BAlance: " + sender.balance)
        console.log("Receiver Balance: " + receiver.balance)
        const after = sender.balance // updated balance to after of sender
        //create a transaction summary in transaction db
        const transaction = await Transaction.create([{
            initiatedAccount: sender._id,
            type: "transfer",
            amount: transferAmount,
            fromAccount: sender.accountNumber,
            toAccount: receiver.accountNumber,
            balancebefore: before,
            balanceafter: after

        }], { session });

        // Commit all changes
        await session.commitTransaction();
        session.endSession();

        return({
            status:200,
            balance: sender.balance,
            transaction: transaction
            
        })


    } catch (error) {
        // Rollback everything on error
        await session.abortTransaction();
        session.endSession();
        // show error thereby

        throw AppError(error.statusCode || 500, error.message || 'Transfer failed', error.errorCode || 'TRANSFER_FAILED');
    }
}