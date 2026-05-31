import mongoose from "mongoose";
import { Transaction } from "../models/transactions.js";
import { User } from "../models/User.js";
import AppError from "../utils/AppError.js"

export const depositService=async (amounts,req,res) => {
    const amount = Number(amounts); // because the amt is sent as string
    // Validate amount
    if (amount <= 0 || isNaN(amount)) {
        throw new AppError('Invalid amount', 400);
    }
    const authorized_id = req.user.id // this comes from authorization through auth.js middleware
    // check if the authorized user exists
    let user = await User.findById(authorized_id);

    if (!user) {
        throw new AppError(404, "User not found", "AUTH_NO_USER");
    }

    const before = user.balance;  // takeout balance from user collection


    user = await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { balance: amount } }, // increament by amount deposited
        { new: true }
    );

    const transaction = await Transaction.create({
        initiatedAccount: user._id,
        type: "credit",
        amount: amount,
        balancebefore: before,
        balanceafter: user.balance
    })
   return ({status: 200, data: { balance: user.balance, transaction: transaction }});
}