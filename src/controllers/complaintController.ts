import { Request, Response } from 'express';
import { db } from '../config/db';
import { stringify } from 'csv-stringify';

export const createComplaint = async (req: Request, res: Response) => {
    // التحقق من أن المستخدم موجود في الطلب (بفضل الـ authMiddleware)
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No photo file was uploaded' });
    }

    const { subject, description, location, category_id } = req.body;
    const photo_url = req.file.path; // Multer saves the path here

    try {
        const result = await db.query(
            'INSERT INTO complaints (user_id, subject, description, photo_url, location, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, subject, description, photo_url, location, category_id]
        );
        res.status(201).json({ success: true, message: 'Complaint created successfully', data: result.rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Complaint creation failed', error: error.message });
    }
};
export const getAllComplaints = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM complaints ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to retrieve complaints', error: error.message });
    }
};
export const getComplaintById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await db.query('SELECT * FROM complaints WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to retrieve complaint', error: error.message });
    }
};
export const updateComplaint = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await db.query(
            'UPDATE complaints SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        res.status(200).json({ success: true, message: 'Complaint updated successfully', data: result.rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update complaint', error: error.message });
    }
};
export const deleteComplaint = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM complaints WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete complaint', error: error.message });
    }
};
export const getUserComplaints = async (req: Request, res: Response) => {
    // جلب معرف المستخدم من الـ token الذي تم التحقق منه
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to retrieve user complaints', error: error.message });
    }
};
export const getComplaintsByCategory = async (req: Request, res: Response) => {
    const { category_id } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM complaints WHERE category_id = $1 ORDER BY created_at DESC',
            [category_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No complaints found for this category' });
        }
        res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to retrieve complaints by category', error: error.message });
    }
};
const processArabicText = (text: string) => {
    // هذه الطريقة البسيطة تقلب النص بالكامل
    // ليعمل بشكل صحيح في PDFKit الذي لا يدعم RTL
    return text.split('').reverse().join('');
};

export const exportComplaints = async (req: Request, res: Response) => {
    const { category_id, format, date_from, date_to } = req.query;

    if (format !== 'csv') {
        return res.status(400).json({ success: false, message: 'Invalid format specified. Only CSV is supported.' });
    }

    let queryText = 'SELECT * FROM complaints WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (category_id) {
        queryText += ` AND category_id = $${paramIndex}`;
        queryParams.push(category_id);
        paramIndex++;
    }

    if (date_from) {
        queryText += ` AND created_at >= $${paramIndex}`;
        queryParams.push(date_from);
        paramIndex++;
    }

    if (date_to) {
        queryText += ` AND created_at <= $${paramIndex}`;
        queryParams.push(date_to);
        paramIndex++;
    }

    queryText += ' ORDER BY created_at DESC';

    try {
        const result = await db.query(queryText, queryParams);

        const columns = Object.keys(result.rows[0] || {});
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
        stringify(result.rows, { header: true, columns: columns }).pipe(res);
        
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to export reports', error: error.message });
    }
};