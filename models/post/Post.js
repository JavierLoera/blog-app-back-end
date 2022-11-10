import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Post title is required"],
        trim: true
    },
    category: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],
        required: [true, "Post category is required"],
        default: ['635ec7db146499556ca5f6dd']
    },
    numViews: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    disLikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author is required"]
    },
    description: {
        type: String,
        required: [true, "Post description is required"],
    },
    image: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2020/10/02/21/06/dome-5622133_960_720.jpg"
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true
});

PostSchema.virtual("comments", {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post',
})




export const Post = mongoose.model("Post", PostSchema)