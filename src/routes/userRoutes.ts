import { Router } from 'express';
import { registerUser, loginUser, verifyToken, getAllUsers, updateUser, deleteUser } from '../controllers/userController'; // قم بتحديث هذا السطر
import { authMiddleware } from '../middleware/authMiddleware';
const router = Router();

router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.get('/auth/verify', authMiddleware, verifyToken); 
router.get('/users', authMiddleware, getAllUsers);
router.put('/users/:id', authMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, deleteUser);
export default router;