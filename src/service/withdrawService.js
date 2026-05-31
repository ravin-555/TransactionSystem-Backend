import mongoose from "mongoose";
import { Transaction } from "../models/transactions.js";
import { User } from "../models/User.js";

export const withdrawService=async (amounts,req,res) => {
    const amount = Number(amounts); // because the amt is sent as string

    // validate amount
    if (amount < 0 || isNaN(amount)) {
        throw new Error("Invalid amount");
        
    }
    const authorized_id = req.user.id // this comes from authorization through auth.js middleware
    //update only if user has a balance greater than amount
    const user = await User.findOneAndUpdate({ _id: authorized_id, balance: { $gte: amount } },
        { $inc: { balance: -amount } }, { new: true }  // update query
    );
    if (!user) throw new Error("Insufficient Balance");
    
    const before = user.balance + amount;
    const transaction = await Transaction.create({
        initiatedAccount: user._id,
        type: "debit",
        amount: amount,
        balancebefore: before,
        balanceafter: user.balance
    })
    return({ balance: user.balance, transaction: transaction });
}
