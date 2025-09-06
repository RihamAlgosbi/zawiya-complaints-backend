import { Router } from 'express';
import { getAllCategories, createCategory, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/categories', getAllCategories);

router.post('/categories', authMiddleware, createCategory);
router.get('/categories/:id', authMiddleware, getCategoryById);
router.patch('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);

export default router;