import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: [true, "Post is required"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    description: {
        type: String,
        required: [true, "Comment description is required"],
    },
}, { timestamps: true })



export const Comment = mongoose.model("Comment", CommentSchema);