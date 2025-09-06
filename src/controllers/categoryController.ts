import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to retrieve categories', error: error.message });
    }
};
export const createCategory = async (req: Request, res: Response) => {
    const { name, description, is_active } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO categories (name, description, is_active) VALUES ($1, $2, $3) RETURNING *',
            [name, description, is_active]
        );
        res.status(201).json({ success: true, message: 'Category created successfully', data: result.rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to retrieve category', error: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    try {
        const result = await db.query(
            'UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *',
            [name, description, is_active, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category updated successfully', data: result.rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
    }
};