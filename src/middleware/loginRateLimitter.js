
//   Limits login attempts to prevent brute-force attacks
//   5 attempts per 5 minutes per IP
 
import rateLimit from "express-rate-limit";
import AppError from "../utils/AppError.js";

export const loginlimitter= rateLimit({
    windowMs:1*60*1000, // 5 miniute window
    limit:5, // limit to 5 attempts per 1 minutes
    standardHeaders: true,// Return rate limit info in headers with Standard IETF RateLimit headers 
    legacyHeaders:false,

    // handle error when limit exceeds
    handler:(req,res,next)=>{
       return next(new AppError(429, "Too many login attempts. Try again after 1 minutes.", "RATE_LIMIT_EXCEEDED"));
    }
})