import expres from 'express'
import { createComment, deleteComment, fetchComment, updateComment } from '../../controllers/comments/comment.controller.js';
import { authMiddleware } from '../../middlewares/auth/authMiddleware.js'

const router = expres.Router();

router.post('/', authMiddleware, createComment);
router.get('/:id', authMiddleware, fetchComment);
router.patch('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment)

export default router