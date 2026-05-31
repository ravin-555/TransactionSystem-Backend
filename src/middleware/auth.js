/*
   AUTHENTICATION MIDDLEWARE
   ------------------------------------------------------------
   Purpose:
    Protect private routes
    Verify JWT token sent by client
    Attach authenticated user data to request object
   ============================================================ */
import jwt from 'jsonwebtoken';
import AppError from "../utils/AppError.js";

const auth = (req, res, next) => {
    // Read Authorization header from client 
    //    Expected format: Authorization: Bearer < token >
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(401, 'Unauthorized', 'AUTH_UNAUTHORIZED');
    }

    try {
        const token = authHeader.split(' ')[1]; // from Bearer <token> splitting 1 index by space ie. token
        console.log("Token received:", token);

        // Verify token authenticity
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //     attach user information to request object
    //    This makes user data available to next handlers (in this case , in server.js next middleware deposit/withdraw)
        req.user = decoded;
        next(); //(withdraw / deposit)
    } catch (error) {
        console.log("JWT error:", error.message);
       throw new AppError(401, 'Invalid token', 'AUTH_INVALID_TOKEN', error.message);
    }
};

export default auth;
