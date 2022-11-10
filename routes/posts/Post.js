import express from "express"
import { createPost, fetchPosts, fetchPost, updatePost, deletePost, toggleAddLikeToPost, toggleDislikeToPost } from "../../controllers/posts/post.controller.js";
import { authMiddleware } from "../../middlewares/auth/authMiddleware.js"
import { photoUploadMiddleware, postPhotoResize } from "../../middlewares/uploads/photoUpload.js";

const router = express.Router();


router.post("/", authMiddleware, photoUploadMiddleware.single('image'), postPhotoResize, createPost)
router.get('/', fetchPosts);
router.patch('/like', authMiddleware, toggleAddLikeToPost);
router.patch('/dislike', authMiddleware, toggleDislikeToPost)
router.get('/:id', fetchPost);
router.patch('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

export default router