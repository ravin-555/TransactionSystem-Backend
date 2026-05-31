import mongoose from "mongoose";
import { Transaction } from "../models/transactions.js";
import {User} from "../models/User.js";
import {idempotencyKey} from "../models/IdempotencyKey.js";
import { transferService } from "../service/transferService.js";
import { withdrawService } from "../service/withdrawService.js";
import { depositService } from "../service/depositService.js";
import { reversalService } from "../service/reversalService.js";
import AppError from "../utils/AppError.js";


export const deposit= async(req,res,next)=>{
    const response = await depositService(req.body.amount,req,res);
    return res.status(200).json({
        message: "Deposit successful",
        data: response
    });
}

export const withdraw=async (req,res,next) => {
    const response=await withdrawService(req.body.amount,req,res);
    return res.status(200).json({
        message: "Withdrawal successful",
        data: response
    });
}

export const transfer=async (req,res) => {
    console.log(" Request body :",req.body)
    const response= await transferService(req.user.id, req.body.amount, req.body.toUser)
    console.log("transfer response :",response)

    // Save idempotency result
    await idempotencyKey.findOneAndUpdate({
        key: req.idempotencyKey, // from idempotency middleware
        userId: req.user.id
    }, {
        response: response,
        statusCode: response.status||200
    }, { upsert: true });
    
    return res.status(response.status || 200).json({
        message:"Transfer successful",
        data: response
    });
}

export const reverseTransaction=async (req,res,next) => {
    const response = await reversalService(req.user.id, req.params.id)

    // Save idempotency result
    await idempotencyKey.findOneAndUpdate({key: req.idempotencyKey, userId: req.user.id},
    {
        response: response,
        statusCode: response.status
    }, { upsert: true }); 

    return res.status(response.status || 200).json({
        message: "Transaction reversed successfully",
        data: response
    });
}
/* ============================================================
   TRANSACTION HISTORY
   - Returns authenticated user's transactions through a get req
   ============================================================ */
   export const getTransactionHistory = async (req,res,next) => {
    if(req.user.role === 'admin') { // user updated from auth middleware
        const transactions = await Transaction.find().sort({ createdAt: -1});
        return res.status(200).json({
            message: "All transactions retrieved successfully",
            data: transactions
        });
    }
    // if not admin, return only transactions initiated by the user
    const transactions = await Transaction.find(
        {
            $or:[
            {initiatedAccount:req.user.id},
            {toAccount:req.user.accountNumber}
        ],
        type:{$ne:'reversal'}

        }).sort({ createdAt: -1});
        
    return res.status(200).json({
        message: "Transaction history retrieved successfully",
        data: transactions
    })
   }
