import { Router } from 'express';
import { createComplaint, getAllComplaints, getComplaintById, updateComplaint, deleteComplaint, getUserComplaints, getComplaintsByCategory, exportComplaints } from '../controllers/complaintController';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage: storage });

router.post('/complaints', authMiddleware, upload.single('photo'), createComplaint);
router.get('/complaints', authMiddleware, getAllComplaints);

router.get('/complaints/my', authMiddleware, getUserComplaints);

router.get('/complaints/category/:category_id', getComplaintsByCategory); 

router.get('/reports/export', authMiddleware, exportComplaints);

router.get('/complaints/:id', authMiddleware, getComplaintById);
router.patch('/complaints/:id', authMiddleware, updateComplaint);
router.delete('/complaints/:id', authMiddleware, deleteComplaint);

export default router;