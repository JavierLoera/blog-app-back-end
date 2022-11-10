import { Post } from "../../models/post/Post.js";
import expressAsyncHandler from "express-async-handler";
import { validateMongoDbID } from "../../utils/validateMongoDbId.js"
import BadWords from "bad-words"
import { cloudinaryUploadImage } from "../../utils/couldinary.js"
import { User } from "../../models/user/User.js";
import fs from "fs"

const verifyAutority = (idPostUser, idUser) => {
    return idPostUser.equals(idUser)
}

export const createPost = expressAsyncHandler(async (req, res) => {
    const body = req.body;
    const { _id } = req.user;

    const user = await User.findById(_id);
    if (!user.isAccountVerified) throw Error('No puedes Crear post hasta que verifiques tu cuenta')

    validateMongoDbID(_id);
    const badWords = new BadWords();
    const isProfane = badWords.isProfane(body.title, body.description);

    if (isProfane) {
        await User.findByIdAndUpdate(_id, {
            isBlocked: true
        })
        throw new Error("La creacion del post ha fallado por que contiene malas palabras")
    }
    try {
        const localPath = `public/images/posts/${req.file.filename}`;
        const imageUploaded = await cloudinaryUploadImage(localPath);

        const post = await Post.create({
            title: body.title,
            description: body.description,
            category: body.categories,
            user: _id,
            image: imageUploaded?.url
        });
        res.json(post)
        fs.unlinkSync(localPath)
    } catch (error) {
        res.json(error)
    }
})


export const fetchPosts = expressAsyncHandler(async (req, res) => {
    const start = new Date();
    start.setDate(start.getDate() - 5);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    try {
        //get all posts with his author with populate that it takes the name of the field tha has a relation with
        const posts = await Post.find({
            $or: [
                {
                    'createdAt': {
                        $gte: start,
                        $lt: end
                    }
                }, { 'likes.10': { '$exists': true } }
            ]
        }
        ).populate({ path: 'user', select: ['firstName', 'lastName', 'profilePhoto'] }).populate("comments").populate({ path: 'category', select: ['title'] })
        res.json(posts)
    } catch (error) {
        res.json(error)
    }
});

export const fetchPost = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbID(id)
    try {
        const post = await Post.findByIdAndUpdate(id, { $inc: { numViews: 1 } }, { new: true }).populate({ path: 'user', select: ['firstName', 'lastName', 'profilePhoto'] }).populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: ['firstName', 'lastName', 'profilePhoto']
            }
        }).populate({ path: 'category', select: ['title'] })
        res.json(post)
    } catch (error) {
        res.json(error)
    }

})


export const updatePost = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user
    const body = req.body
    validateMongoDbID(id)
    const badWords = new BadWords();
    const isProfane = badWords.isProfane(body.title, body.description);

    if (isProfane) {
        await User.findByIdAndUpdate(_id, {
            isBlocked: true
        })
        throw new Error("La actualizacion del post ha fallado por que contiene malas palabras")
    }

    try {
        const postToUpdate = await Post.findById(id);
        const verifyAutor = await verifyAutority(postToUpdate.user, _id);
        if (!verifyAutor) {
            return res.status(401).json({
                errors: [{
                    "error": "unauthorized",
                    "message": "No tienes permisos para actualizar este post",
                }]
            })
        }

        postToUpdate.title = body.title;
        postToUpdate.description = body.description;
        postToUpdate.category = body.categories
        await postToUpdate.save()
        res.json(postToUpdate)
    } catch (error) {
        res.json(error)
    }
})


export const deletePost = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user
    validateMongoDbID(id)
    try {
        const post = await Post.findById(id);
        const verifyAutor = await verifyAutority(post.user, _id);
        if (!verifyAutor) {
            return res.status(401).json({
                errors: [{
                    "error": "unauthorized",
                    "message": "No tienes permisos para eliminar este post",
                }]
            })
        }
        await post.delete()
        res.json(post);
    } catch (error) {
        res.json(error)
    }

});

export const toggleAddLikeToPost = expressAsyncHandler(async (req, res) => {
    const { postId } = req.body;
    const { _id } = req.user
    validateMongoDbID(postId)

    try {
        const post = await Post.findById(postId)
        const isLiked = post?.likes.findIndex(userId => userId.toString() === _id.toString());
        const isDisliked = post?.disLikes.findIndex(userId => userId.toString() === _id.toString());

        isLiked !== -1 ? post.likes.splice(isLiked, 1) : post.likes.push(_id) && post.disLikes.splice(isDisliked, 1);
        const newpost = await post.save().then(v => v.populate([{ path: 'user', select: ['firstName', 'lastName', 'profilePhoto'] }, 'comments', 'category']))
        res.json(newpost)
    } catch (error) {
        res.json(error)
    }
})


export const toggleDislikeToPost = expressAsyncHandler(async (req, res) => {
    const { postId } = req.body;
    const { _id } = req.user
    validateMongoDbID(postId);
    try {
        const post = await Post.findById(postId);
        const isDisliked = post.disLikes.findIndex(userId => userId.toString() === _id.toString());
        const isLiked = post?.likes.findIndex(userId => userId.toString() === _id.toString());

        isDisliked !== -1 ? post.disLikes.splice(isDisliked, 1) : post.disLikes.push(_id) && post.likes.splice(isLiked, 1);
        const newpost = await post.save().then(v => v.populate([{ path: 'user', select: ['firstName', 'lastName', 'profilePhoto'] }, 'comments', 'category']))
        res.json(newpost)
    } catch (error) {
        res.json(error)
    }

})