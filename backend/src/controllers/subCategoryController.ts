import { Request, Response } from 'express';
import Category from '../models/Category';
import SubCategory from '../models/SubCategory';
import Prompt from '../models/Prompt';
import { generateLearningPlan } from '../services/aiService'; 

export const createSubCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({ message: 'categoryId is required' });
        }

        const parentCategory = await Category.findById(categoryId);
        if (!parentCategory) {
            return res.status(404).json({ message: 'Parent category not found' });
        }

        const newSubCategory = new SubCategory({
            name,
            description,
            categoryId: categoryId 
        });

        await newSubCategory.save();
        res.status(201).json(newSubCategory);
    } catch (error) {
        console.error("Error in createSubCategory:", error);
        res.status(500).json({ message: 'Error creating sub-category' });
    }
};

export const getSubCategoriesByParent = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await SubCategory.find({ categoryId: categoryId });
        res.status(200).json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sub-categories' });
    }
};

export const getAiLearningPlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // קבלת ה-ID של המשתמש לצורך שמירת היסטוריה

        const subCategory = await SubCategory.findById(id);
        if (!subCategory) {
            return res.status(404).json({ message: 'Sub-category not found' });
        }

        let aiResponse: any;

        try {
            const plan = await generateLearningPlan(subCategory.name);
            aiResponse = typeof plan === 'string' ? JSON.parse(plan) : plan;
        } catch (aiError) {
            console.error("AI Error (Fallback to Mock):", aiError);

            // מנגנון גיבוי המאפשר המשכיות של האפליקציה גם במקרה של חסימות רשת או שגיאות API
            aiResponse = {
                step1: `Welcome to ${subCategory.name}: Understanding the core basics and terminology.`,
                step2: `Deep Dive: Practical tools and common methodologies in ${subCategory.name}.`,
                step3: `Advanced Mastery: Final project and real-world application.`
            };
        }

        // שמירת הלימוד בטבלת ה-Prompts כדי לאפשר למשתמש לצפות בהיסטוריית הלמידה שלו בעתיד
        if (userId) {
            const newPrompt = new Prompt({
                userId,
                categoryId: subCategory.categoryId,
                subCategoryId: subCategory._id,
                prompt: `Learn about ${subCategory.name}`,
                response: JSON.stringify(aiResponse)
            });
            await newPrompt.save();
        }

        res.status(200).json({
            topic: subCategory.name,
            plan: aiResponse
        });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};