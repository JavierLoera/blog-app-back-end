import express from "express";
import { deleteUser, fetchUsers, registerUser, UserLogin, fetchUser, userProfile, updateUser, changePassword, followUser, blockUser, generateVerficationToken, verifiToken, forgetPassword, verifyTokenResetPassword, profilePhotoUpload } from '../../controllers/users/User.Controller.js'
import { authMiddleware } from "../../middlewares/auth/authMiddleware.js";
import { profilePhotoResize, photoUploadMiddleware } from "../../middlewares/uploads/photoUpload.js";

const router = express.Router()

router.post('/register', registerUser);
router.post('/login', UserLogin);
router.get('/', authMiddleware, fetchUsers);
router.delete('/:id', authMiddleware, deleteUser);
router.get('/user-auth', authMiddleware, fetchUser);
router.get("/profile/:id", userProfile);
router.put('/:id', authMiddleware, updateUser);
router.patch('/password/', authMiddleware, changePassword);
router.patch('/follow', authMiddleware, followUser);
router.patch('/block-user/:id', authMiddleware, blockUser);
router.post('/generate-verify-email-token', authMiddleware, generateVerficationToken);
router.patch('/verify-account/:token', verifiToken);
router.post('/forget-password-token', forgetPassword);
router.post('/reset-password/:token', verifyTokenResetPassword);
router.patch('/profilephoto-upload', authMiddleware, photoUploadMiddleware.single('image'), profilePhotoResize, profilePhotoUpload)





export default router