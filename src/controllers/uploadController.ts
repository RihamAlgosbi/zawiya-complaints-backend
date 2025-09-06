import { Request, Response } from 'express';
import multer from 'multer';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
 
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});


const upload = multer({ storage: storage });


export const uploadImage = (req: Request, res: Response) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'File upload failed', error: err.message });
    }
    
  
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file was uploaded' });
    }

    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: `http://localhost:3000/uploads/${req.file.filename}`
    });
  });
};