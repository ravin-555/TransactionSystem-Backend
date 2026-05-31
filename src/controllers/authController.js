//  this is for authentication of a user for login and signup
import bcrypt from 'bcrypt'
import { User} from '../models/User.js' 
import { acc_no } from '../utils/generateAccount_no.js';  // to crate a random acc no
import jwt  from 'jsonwebtoken';
import { MailService } from '../service/mailService.js';
import AppError from "../utils/AppError.js";

//. resistering and creating a account
export const register = async (req,res) => {
    const {name,email,password}= req.body;
    console.log(name,email,password);
    const hashedpassword=  await bcrypt.hash(password,10);

    // creating a user to store in db
    const user = await User.create({
        accountNumber : acc_no(),
        name:name,
        email:email,
        passwordHash:hashedpassword,
    })

    // send mail after
   const mailingresponse =  MailService(email,password);

   console.log("After mail :"+mailingresponse);
   return res.status(201).json({
        message: 'Account created',
        data: {
            name: user.name,
            email: user.email,  
            accountNumber: user.accountNumber
        }
    });
}

export const login = async (req,res) => {
    const {accountNumber,password}=req.body;
    console.log(accountNumber,password)
//    finding this credentials in db
    const user=await User.findOne({accountNumber})
    if(!user) {
            throw new AppError(400, "No account found!", "AUTH_NO_ACCOUNT")
    }
    // bcrypt hashed check
    const matched=await bcrypt.compare(password,user.passwordHash);
    if(!matched){
             throw new AppError(400, "Wrong password", "AUTH_INVALID_CREDENTIALS")
    }
    // jwt token  creation (digital signature)
    const acesstoken= jwt.sign(
        {id:user._id,accountNumber:user.accountNumber,role:user.role}, process.env.JWT_SECRET ,
        {expiresIn:'3m'}
    );
    console.log("jwt:"+acesstoken);
    
    const refreshToken=jwt.sign(
        {id:user._id,accountNumber:user.accountNumber,role:user.role},
        process.env.REFRESH_SECRET, // sewcret key for signing the token
        {expiresIn:'7d'} // this token will be used to get a new access token when the old one expires (refresh token)
    )

    // store the refresh token in htttp only cookie for security
    res.cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure: false, // true in production (HTTPS)
        sameSite: 'strict', // to prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    return res.status(200).json({
        message: "Login successful",
       token: acesstoken
    });

}
//get req for user info after login and authentication through auth.js middleware
export const getuser = async (req,res) => {
    const userid=req.user.id;
    const user=await User.findById(userid);
    const token = req.cookies.refreshToken
    if (!token) {
        throw new AppError(401, "No refresh token", "AUTH_NO_REFRESH_TOKEN");
    }
    // sesssion expiry check through refresh token
    try {
        jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (err) {
        throw new AppError(401, "Invalid or expired refresh token", "AUTH_INVALID_REFRESH_TOKEN");
    }


    return res.status(200).json({
        message: "User info retrieved successfully",
        data: user
    });
}

// to return a new token to frontend when the access token expires and the frontend sends a postrequest to /refresh with the refresh 
// token in cookies
export const refreshToken = (req, res) => {
    console.log("Cookies :" + JSON.stringify(req.cookies));
    const token = req.cookies.refreshToken; // get the refresh token from cookies   


    if (!token) {
            throw new AppError(401, "No refresh token", "AUTH_NO_REFRESH_TOKEN");
    }
    
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const newAccessToken = jwt.sign(
        { id: decoded.id , role:decoded.role, accountNumber: decoded.accountNumber},
        process.env.JWT_SECRET,
        { expiresIn: "1m" }
    );

    return res.status(200).json({
        message: "New access token generated",
        token: newAccessToken 
    });
}

export const logout=(req,res)=>{
    res.clearCookie('refreshToken'); //  Empty the refreshToken named cookie  and expired to remove it from browser
    return res.status(200).json({message:"Logged out Successfully"});
}
