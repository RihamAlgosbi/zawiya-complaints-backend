import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


declare global {
    namespace Express {
        interface Request {
            user?: { id: number };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authentication token is required' });
    }

    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication token is required' });
    }

    try {
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
        req.user = { id: decoded.id }; 
        next(); 
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};