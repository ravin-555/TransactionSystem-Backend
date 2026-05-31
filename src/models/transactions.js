import mongoose from "mongoose";
const transactionsSchema= new mongoose.Schema({
    // who initiated the transaction (useful to filter transaction details)
    initiatedAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    type:{ // deposit/withdraw
        type:String,
        enum:['credit','debit','transfer','reversal'],  
        required:true  
    },
    amount:{
        type:Number,
        required:true,
        min:1
    },
    balancebefore: Number,
    balanceafter: Number,
    fromAccount:{
        type:String  // not (required :true) ,because for withdraw and deposit no need to display these from account and toaccount
    },
    toAccount:{
        type:String
    },
    status:{
        type:String,
        enum:["PENDING","SUCESS","FAILED"],
        default:"SUCESS"
    },
    
    relatedTransaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Transaction'
    }
    
},
 
   {timestamps:true}
);

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionsSchema);