//  to use routelevel middlewares from controllers to a route

import express from 'express'
import { login, register ,getuser } from '../controllers/authController.js'
import { loginlimitter } from '../middleware/loginRateLimitter.js'
import { refreshToken } from '../controllers/authController.js'
import { logout } from '../controllers/authController.js'
import auth from '../middleware/auth.js'
import { catchAsync } from "../utils/asyncHandler.js"
const router = express.Router()

router.post('/register',loginlimitter, catchAsync(register));
router.post('/login',loginlimitter, catchAsync(login)); // apply limitter to /login route
router.get('/user',auth,catchAsync(getuser)); // get req to get user info after login and authenticationt through auth.js middleware

router.post('/refresh', catchAsync(refreshToken)); // route to get a new access token when the access token expires and the frontend sends a postrequest to /refresh with the refresh token in cookies
//check for router test
router.post('/test', (req, res) => {
    console.log('BODY:', req.body);
    res.json({ ok: true });
});
router.post('/logout',logout);


export default router;
