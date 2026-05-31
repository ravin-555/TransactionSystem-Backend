import mongoose from "mongoose";
const userSchema= new mongoose.Schema({
    role:{
        type:String,
        enum:["user","admin","auditor"],
        default:"user"
    },
    accountNumber:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String, 
        required:true
    },
    email:{
        type:String,
        required:true
    },
    passwordHash:{
        type:String,
        required:true
    },
    balance:{
        type:Number,
        default:0,
        min:0
    }
},
 
{timestamps:true}
);
export const User = mongoose.models.User || mongoose.model('User',userSchema);
