import { Request, Response } from 'express';
import { db } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

   
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    try {
        
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'User already exists with this email' });
        }

       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const result = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        res.status(201).json({ success: true, message: 'User registered successfully', user: result.rows[0] });

    } catch (error: any) {
        res.status(500).json({ success: false, message: 'User registration failed', error: error.message });
    }
};
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];

       
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};
export const verifyToken = (req: Request, res: Response) => {
 
    res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: req.user
    });
};
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to retrieve users', error: error.message });
    }
};
export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, email, password, full_name, role_id } = req.body;
    try {
        let queryText = 'UPDATE users SET';
        const queryParams = [];
        let paramIndex = 1;

        if (username !== undefined) {
            queryText += ` username = $${paramIndex},`;
            queryParams.push(username);
            paramIndex++;
        }
        if (email !== undefined) {
            queryText += ` email = $${paramIndex},`;
            queryParams.push(email);
            paramIndex++;
        }
        if (password !== undefined) {
            const hashedPassword = await bcrypt.hash(password, 10);
            queryText += ` password = $${paramIndex},`;
            queryParams.push(hashedPassword);
            paramIndex++;
        }
        if (full_name !== undefined) {
            queryText += ` full_name = $${paramIndex},`;
            queryParams.push(full_name);
            paramIndex++;
        }
        if (role_id !== undefined) {
            queryText += ` role_id = $${paramIndex},`;
            queryParams.push(role_id);
            paramIndex++;
        }

        queryText = queryText.slice(0, -1); // لإزالة الفاصلة الزائدة
        queryText += ` WHERE id = $${paramIndex} RETURNING id, username, email, full_name, role_id`;
        queryParams.push(id);

        const result = await db.query(queryText, queryParams);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
};