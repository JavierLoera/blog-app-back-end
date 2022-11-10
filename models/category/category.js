import mongoose from "mongoose";

const CategorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "user is required"]
    },
    title: {
        type: String,
        required: [true, "title is required"]
    },
}, { timestamps: true })

export const Category = mongoose.model("Category", CategorSchema)