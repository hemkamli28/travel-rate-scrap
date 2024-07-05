import jwt from "jsonwebtoken";
import { BadRequestException } from "../utilities/errorClasses.js";

export const refreshTokenVerify = async (req, res, next) => {
    const { refreshToken }= req.body;
    try {
        if (!refreshToken) {
            throw new Error("No refresh-token provided");
        }
        const data = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        req.user = data.email;
        next();
        
    } catch (err) {
        console.error(err);

        if (err.name === 'JsonWebTokenError') {
            next (new BadRequestException('Invalid Token!'));
        }
        next (new BadRequestException('Invalid Refresh Token!'));
    }
};
