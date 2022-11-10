import { User } from "../../models/user/User.js"
import expressAsyncHandler from "express-async-handler";
import { generateToken } from '../../token/generateToken.js'
import { validateMongoDbID } from "../../utils/validateMongoDbId.js";
import sgMail from '@sendgrid/mail'
import crypto from 'crypto'
import { cloudinaryUploadImage } from "../../utils/couldinary.js"
import fs from "fs";

export const registerUser = expressAsyncHandler(async (req, res) => {
    const body = req.body
    const isUserInDb = await User.findOne({ email: body.email });
    if (isUserInDb) {
        throw new Error("El email ya ha sido tomado")
    }
    try {
        const user = await User.create(body)

        res.json(user)
    } catch (error) {
        res.json(error)
    }
});


export const UserLogin = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body
    const UserInDb = await User.findOne({ email });
    if (!UserInDb) throw new Error("Email o contraseña incorrectos");
    if (UserInDb.isBlocked) throw new Error("Estas bloqueado no puede inicar sesion")
    const match = await UserInDb.comparePassword(password)
    if (UserInDb && match) {
        return res.json({
            token: generateToken(UserInDb._id),
        })
    } else {
        res.status(401)
        throw new Error("Email o contraseña incorrectos")
    }
})


export const fetchUsers = expressAsyncHandler(async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select('firstName lastName profilePhoto isBlocked')
        res.json(users)
    } catch (error) {
        res.json(error)

    }
})

export const deleteUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbID(id)
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        res.json(deletedUser)
    } catch (error) {
        res.json(error)
    }
})


export const fetchUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongoDbID(id)
    try {
        const user = await User.findById(id).select("-password");
        res.json(user)
    } catch (error) {
        res.json(error)
    }

})


export const userProfile = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbID(id)
    try {
        const myProfile = await User.findById(id).select("-password").populate({
            path: 'posts', options: { sort: { 'createdAt': -1 } }, populate: {
                path: 'category'
            }
        })
        res.json(myProfile)
    } catch (error) {
        res.json(error)

    }
})

export const updateUser = expressAsyncHandler(async (req, res) => {
    const id = req?.user?._id;
    validateMongoDbID(id);
    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            bio: req?.body?.bio,
        }, { new: true, runValidators: true }).select("-passwordResetToken -passwordResetExpires")

        res.json(updatedUser)
    } catch (error) {
        res.json(error)
    }
})


export const changePassword = expressAsyncHandler(async (req, res) => {
    const id = req?.user?._id;
    const { password } = req.body
    validateMongoDbID(id);
    try {
        const user = await User.findById(id);
        if (password) {
            user.password = password;
            const updatedUser = await user.save();
            res.json(updatedUser)
        }
    } catch (error) {
        res.json(error)
    }
})


export const followUser = expressAsyncHandler(async (req, res) => {
    const { id: idUserToFollow } = req.body;
    const idUserFollowing = req.user.id
    validateMongoDbID(idUserFollowing)
    validateMongoDbID(idUserToFollow)
    try {
        const userTofollow = await User.findById(idUserToFollow);
        const userFollowing = await User.findById(idUserFollowing);

        const index = userFollowing.following.findIndex((elem) => elem.toString() === idUserToFollow.toString())
        const indexUserFollowers = userTofollow.followers.findIndex(elem => elem.toString() === idUserFollowing.toString());

        if (index === -1) {
            await userFollowing.following.push(idUserToFollow);
            userFollowing.isFollowing = true;
            await userTofollow.followers.push(idUserFollowing);
        } else {
            await userFollowing.following.splice(index, 1);
            userFollowing.isFollowing = false;
            await userTofollow.followers.splice(indexUserFollowers, 1);
        }
        await userFollowing.save();
        await userTofollow.save()

        res.status(200).json({ message: "Operacion realizada con exito" });
    } catch (error) {
        res.json(error)
    }
})


export const blockUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbID(id);
    if (!req.user.isAdmin) {
        return res.status(491).json({
            errors: [{
                "error": "unauthorized",
                "message": "No tienes permisos para bloquear",
            }]
        })
    }

    try {
        const user = await User.findById(id)
        // const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true })
        user.isBlocked ? user.isBlocked = false : user.isBlocked = true;
        await user.save()
        res.status(200).json({ message: "Operacion realizada con exito" });
    } catch (error) {
        res.json(error)
    }
})

export const generateVerficationToken = expressAsyncHandler(async (req, res) => {
    const id = req?.user?.id;
    const user = await User.findById(id);
    try {
        sgMail.setApiKey(process.env.SENDGRID_KEY)
        const verificationToken = await user.generateVerificationToken();
        console.log("🚀 ~ file: User.Controller.js ~ line 185 ~ generateVerficationToken ~ verificationToken", verificationToken)
        await user.save()
        const msg = {
            to: 'jesus_loera_15@outlook.com',
            from: 'jesus_loera_15@hotmail.com',
            subject: 'Sending with SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
            html: `<strong>If your were requested to verifiy your account,verify now within 10 minutes,otherwise ignore this message <a href="${process.env.FRONT_URL}verify-account/${verificationToken}">Click here</a> or paste this in a browser ${process.env.FRONT_URL}verify-account/${verificationToken}</strong>`,
        }
        await sgMail.send(msg)
        res.json({ message: `Un mensaje de verificacion fue enviado al email ` })
    } catch (error) {
        res.json(error)
    }
})

export const verifiToken = expressAsyncHandler(async (req, res) => {
    const { token } = req.params
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    try {
        const user = await User.findOne({
            accountVerificationToken: hashedToken,
            accountVerificationTokenExpires: { $gt: new Date() }
        });

        if (!user) throw new Error("El token ha expirado prueba de nuevo");
        user.isAccountVerified = true;
        user.accountVerificationToken = undefined;
        user.accountVerificationTokenExpires = undefined
        await user.save()
        res.json(user)
    } catch (error) {
        res.send(error)
    }
})

export const forgetPassword = expressAsyncHandler(async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("No se encontro el usuario");

        const token = await user.createPasswordResetToken();
        await user.save();

        sgMail.setApiKey(process.env.SENDGRID_KEY)
        const msg = {
            to: email,
            from: 'jesus_loera_15@hotmail.com',
            subject: 'Change your password',
            text: 'Este email se envio para cambiar la contraseña',
            html: `<strong>If your were requested to verifiy your account,verify now within 10 minutes,otherwise ignore this message <a href="${process.env.FRONT_URL}reset-password/${token}">Click here</a>, \bor paste this in a browser ${process.env.FRONT_URL}reset-password/${token}</strong>`,
        }
        await sgMail.send(msg)
        res.json({ message: `Un email para restablecer tu contraseña fue enviado cone exito a: ${email} ` })

    } catch (error) {
        res.json(error)
    }

})


export const verifyTokenResetPassword = expressAsyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    try {
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        })
        if (!user) throw new Error("El token ha exipardo prueba de nuevo");
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined
        await user.save();
        res.json({ message: "La contraseña se ha cambiado con exito" })
    } catch (error) {
        res.json(error)

    }
})


export const profilePhotoUpload = expressAsyncHandler(async (req, res) => {
    const { _id } = req.user
    if (!req.file) return res.status(402).json({ message: 'No se proporciono una imagen' })
    try {
        const localPath = `public/images/profile/${req.file.filename}`;
        const imageUploaded = await cloudinaryUploadImage(localPath);

        const user = await User.findByIdAndUpdate(_id, { profilePhoto: imageUploaded?.url }, { new: true }).select("-password")
        res.json(user)
        fs.unlinkSync(localPath)
    } catch (error) {
        res.json(error)
    }
})