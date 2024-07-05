import jwt from "jsonwebtoken";
import { BadRequestException, ForbiddenException } from "../utilities/errorClasses.js";

export const authUser = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    try {
        if (!token) {
            throw new Error("No token provided");
        }
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.email;
        next();
        
    } catch (err) {

        if (err.name === 'TokenExpiredError') {
            next(new ForbiddenException("Token expired!"));

        }
        next(new BadRequestException("Invalid Token!"));
    }
};
