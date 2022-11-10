import { Category } from "../../models/category/category.js";
import expressAsyncHandler from "express-async-handler";
import { validateMongoDbID } from "../../utils/validateMongoDbId.js"


export const createCategory = expressAsyncHandler(async (req, res) => {
    try {
        const categoryExist = await Category.findOne({ title: req.body.title })
        if (categoryExist !== null) {
            return res.status(400).json({
                errors: [{
                    error: 'Duplicado',
                    message: 'Ya existe una categoria con ese nombre'
                }]
            })
        }

        const category = await Category.create({
            user: req.user._id,
            title: req.body.title
        })
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})

export const fetchCategories = expressAsyncHandler(async (req, res) => {
    try {
        const categories = await Category.find().sort("-createdAt")
        res.json(categories)
    } catch (error) {
        res.json(error)
    }

})

export const fetchOneCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const category = await Category.findById(id).populate("user");
        if (category == null) {
            res.status(404).json({ message: "No se encontro" })
        }
        else {
            res.json(category)

        }
    } catch (error) {
        res.json(error)
    }

})

export const updateCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbID(id)
    try {
        const catgeoryUpdated = await Category.findByIdAndUpdate(id, { title: req.body.title }, { new: true })
        if (category == null) {
            res.status(404).json({ message: "No se encontro" })
        }
        else {
            res.json(catgeoryUpdated)
        }
    } catch (error) {
        res.json(error)
    }
})

export const deleteCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbID(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error) {
        res.json(error);
    }

})