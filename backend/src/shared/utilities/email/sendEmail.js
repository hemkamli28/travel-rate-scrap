import { NotFoundException } from "../errorClasses.js";
import { emailInterface } from "./emailInterface.js";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hemk2810@gmail.com', // replace with your Gmail address
        pass: 'ozsd zvfu nvpr brhn'   // replace with your Gmail password
    }
});
export const sendOtp = async (email, userName , otp) => {
    try {
        const content = await emailInterface(userName, otp);

        const mailOptions = {
            from: 'hemk2810@gmail.com',
            to: email,
            subject: 'Your OTP for Password Reset',
            html: content,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(error);
        throw new NotFoundException('Failed to send!');
    }
}