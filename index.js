import express from "express";
import dotenv from "dotenv"
import { connection } from "./config/db/dbConnection.js"
import userRoutes from './routes/users/User.js'
import postRoutes from './routes/posts/Post.js'
import CommentRoutes from './routes/comments/Comment.js';
import categoryRouter from "./routes/category/category.js"
import { errorHandler, notFoundError } from './middlewares/error/errorHandler.js'
import cors from "cors"

dotenv.config()
connection()
const app = express();

app.use(express.json())
app.use(cors());

app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', CommentRoutes);
app.use('/api/category', categoryRouter)
app.use(notFoundError)
app.use(errorHandler)


const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`server running on: http://localhost:${PORT}`))

