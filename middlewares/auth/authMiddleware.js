import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { User } from "../../models/user/User.js";

export const authMiddleware = expressAsyncHandler(async (req, res, next) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        try {
            const token = req.headers['authorization'].split(' ')[1];
            if (!token) throw new Error('Unauthorized');
            else {
                const tokenDecoded = jwt.verify(token, process.env.JWT_KEY);
                const user = await User.findById(tokenDecoded?.id).select("-password")
                req.user = user
                next()
            }
        } catch (error) {
            throw new Error("Not authorizated,login again")
        }
    }
    else {
        throw new Error('Unauthorized')
    }
})