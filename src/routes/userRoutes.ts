import { Router } from 'express';
import { registerUser, loginUser, verifyToken, getAllUsers } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
const router = Router();

router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.get('/auth/verify', authMiddleware, verifyToken); 
router.get('/users', authMiddleware, getAllUsers);

export default router;