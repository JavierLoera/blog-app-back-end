import express from "express";
import { createCategory, deleteCategory, fetchCategories, fetchOneCategory, updateCategory } from "../../controllers/category/category.controller.js";
import { authMiddleware } from "../../middlewares/auth/authMiddleware.js";
import { validateIsAdmin } from "../../middlewares/users/validateIsAdmin.js";

const router = express.Router()

router.post("/", authMiddleware, validateIsAdmin, createCategory);
router.get("/", authMiddleware, fetchCategories);
router.get("/:id", authMiddleware, validateIsAdmin, fetchOneCategory);
router.patch("/:id", authMiddleware, validateIsAdmin, updateCategory);
router.delete('/:id', authMiddleware, validateIsAdmin, deleteCategory)

export default router