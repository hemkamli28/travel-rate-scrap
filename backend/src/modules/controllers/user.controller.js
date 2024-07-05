import {
  addNewUser,
  changePassword,
  checkUserLogin,
  generateOtp,
  getUserEmail,
  validateOtp
} from "../../shared/utilities/dbFunctions.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../shared/utilities/errorClasses.js";
import { sendOtp } from "../../shared/utilities/email/sendEmail.js";

export const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req?.body;

    const user = await addNewUser(username, email, password);
    return res?.status(201)?.json({
      success: true,
      message: "User Registered Successfully!",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req?.body;
    const loginIdentifier = username || email;
    const user = await checkUserLogin(loginIdentifier, password);
    const data = {
      email: user.email,
    };

    const accessToken = jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(data, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return res?.status(200)?.json({
      success: true,
      message: "Login Successfully!",
      token: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const generateNewToken = async (req, res, next) => {
  try {
    const email = req.email;
    const data = {
      email: email,
    };
    const accessToken = jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({
      success: true,
      message: "New Token Generated!",
      token: accessToken,
    });
  } catch (error) {
    next(new BadRequestException("Failed to Generate!"));
  }
};

export const sendEmail = async (req, res, next) => {
  try {
    const { email } = req?.body;
    const user = await getUserEmail(email);
    const otp = await generateOtp(email);

    const mailSent = await sendOtp(user.email, user.user_name, otp);
    if (!mailSent) {
      next(new NotFoundException("User Not Found!"));
    }

    return res.status(200).json({
      success: true,
      message: "Email Sent!",
    });
  } catch (error) {
    next(new BadRequestException("Failed to Send Mail!"));
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req?.body;
    console.log(typeof(otp))
    const verified = await validateOtp(email, otp);
    if (!verified) {
      next(new UnauthorizedException("Invalid Otp"));
    }
    return res.status(200).json({
      success: true,
      message: "Otp Verified!",
    });
  } catch (error) {
    next(new UnauthorizedException("Invalid Otp"));
  }
};

export const resetPassword = async (req, res, next) =>{
  try {
    const { email , password } = req?.body;
    const reset = await changePassword(email, password);
    if(!reset){
      next(new UnauthorizedException("Failed to Update"));
    }
    return res.status(200).json({
      success: true,
      message: "Password Updated successfully!",
    });
  } catch (error) {
    next(new UnauthorizedException("Failed to update password!"));
    
  }
}
