import Jwt from "jsonwebtoken";

export const generateToken = id => {
    return Jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: '10d' })
}