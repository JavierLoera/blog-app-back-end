import expressAsyncHandler from "express-async-handler";
import { Comment } from '../../models/comment/Comment.js'
import { validateMongoDbID } from "../../utils/validateMongoDbId.js"


const verifyAutority = (idPostUser, idUser) => {
    return idPostUser.equals(idUser)
}

export const createComment = expressAsyncHandler(async (req, res) => {
    const user = req.user;
    const { postId, description } = req.body

    try {
        const comment = await Comment.create({
            post: postId,
            user,
            description
        })
        res.json(comment)
    } catch (error) {
        res.json(error)
    }
})


export const fetchComment = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbID(id)

    try {
        const comment = await Comment.findById(id).populate("user")
        if (comment == null) {
            res.status(404).json({ message: "No se encontro un comentario con ese id" })
        } else {
            res.json(comment);
        }
    } catch (error) {
        res.json(error);
    }

})

export const updateComment = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user
    const { description } = req.body
    validateMongoDbID(id)
    try {
        const commentToUpdate = await Comment.findById(id);
        const verifyAutor = await verifyAutority(commentToUpdate.user, _id);
        if (!verifyAutor) {
            return res.status(401).json({
                errors: [{
                    "error": "unauthorized",
                    "message": "No tienes permisos para actualizar este comentario",
                }]
            })
        }
        commentToUpdate.description = description
        const newComment = await commentToUpdate.save().then(v => v.populate({ path: 'user', select: ['firstName', 'lastName', 'profilePhoto'] }))
        res.json(newComment)
    } catch (error) {
        res.json(error)
    }

})


export const deleteComment = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    const { _id } = req.user
    validateMongoDbID(id);
    try {
        const commentToDelete = await Comment.findById(id);
        const verifyAutor = await verifyAutority(commentToDelete.user, _id);
        if (!verifyAutor) {
            return res.status(401).json({
                errors: [{
                    "error": "unauthorized",
                    "message": "No tienes permisos para eliminar este comentario",
                }]
            })
        }
        await commentToDelete.delete()
        res.json(commentToDelete);
    } catch (error) {
        res.json(error)
    }
})