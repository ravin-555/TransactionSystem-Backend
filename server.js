import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js'
import transactionRoutes from './src/routes/transactionsRoute.js'
import adminRoutes from './src/routes/adminRoutes.js'
import cookieParser from 'cookie-parser';
import { ErrorHandler } from './src/middleware/ErrorHandler.js';
import rateLimit from 'express-rate-limit';

const app = express();
dotenv.config();
// connect to db
connectDB();
// set trust proxy for rate limiting to work correctly behind proxies (like in production with load balancers)
app.set('trust proxy', 1);
//  Route level Middlewares that applies to the routes only
app.use(express.json());

// to handle CORS (Cross-Origin Resource Sharing) issues when frontend and backend are on different domains or ports
const corsOptions = {
    origin: process.env.FRONTEND_URL, // allow requests from this origin (frontend)
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // This enables the Access-Control-Allow-Credentials header
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    exposedHeaders:['RateLimit-Limit','RateLimit-Remaining','RateLimit-Reset'] // to expose rate limit headers to frontend for better user experience
};

app.use(cors(corsOptions));
app.use(cookieParser()); // to parse cookies from incoming requests, especially for handling refresh tokens stored in cookies



//  Auth 
app.use('/api/auth',authRoutes)

// transaction apis
app.use('/api/transactions',transactionRoutes) 
app.use('/api/admin',adminRoutes)

// Global error handler
app.use(ErrorHandler)



   

const PORT = process.env.PORT || 5000
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});