import express from "express";

import { generateNewToken, loginUser, registerUser, resetPassword, sendEmail, verifyOtp } from "../controllers/user.controller.js";
import { loginValidator, registerValidator } from "../../shared/validators/userValudator.js";
import { refreshTokenVerify } from "../../shared/middleware/refreshTokenVerify.js";

//express router
const router = express.Router();

//Post Requests 
router.post('/register', registerValidator , registerUser);
router.post('/login', loginValidator , loginUser);
router.post('/refresh-token', refreshTokenVerify, generateNewToken);
router.post('/send-email', sendEmail )
router.post('/verify-otp', verifyOtp )
router.post('/reset-password' , resetPassword)


export default router;