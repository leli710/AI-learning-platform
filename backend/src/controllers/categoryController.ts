import { Request, Response } from 'express';
import Category from '../models/Category';

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // בדיקה שמונעת כפילויות ללא רגישות לאותיות גדולות/קטנות 
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const newCategory = new Category({ name: name.trim() });
        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (error: any) {
        console.error("Error in createCategory:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        // frontendשליפה במיון אלפביתי כדי להקל על הצגת הנתונים ב
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error: any) {
        console.error("Error in getCategories:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};