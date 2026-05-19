import { Request, Response } from 'express';
import Category from '../models/Category';
import SubCategory from '../models/SubCategory';
import Prompt from '../models/Prompt';
import { generateAIResponse } from '../services/aiService';

export const createSubCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, categoryId } = req.body;
        if (!categoryId) return res.status(400).json({ message: 'categoryId is required' });
        const parentCategory = await Category.findById(categoryId);
        if (!parentCategory) return res.status(404).json({ message: 'Parent category not found' });
        const newSubCategory = new SubCategory({ name, description, categoryId });
        await newSubCategory.save();
        res.status(201).json(newSubCategory);
    } catch (error) {
        console.error('Error in createSubCategory:', error);
        res.status(500).json({ message: 'Error creating sub-category' });
    }
};

export const getSubCategoriesByParent = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await SubCategory.find({ categoryId });
        res.status(200).json(subCategories);
    } catch (error) {
        console.error('Error fetching sub-categories by parent:', error);
        res.status(500).json({ message: 'Error fetching sub-categories' });
    }
};

export const getAllSubCategories = async (req: Request, res: Response) => {
    try {
        const subCategories = await SubCategory.find();
        res.status(200).json(subCategories);
    } catch (error) {
        console.error('Error fetching all sub-categories:', error);
        res.status(500).json({ message: 'Error fetching sub-categories' });
    }
};

export const getAiLearningPlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const subCategory = await SubCategory.findById(id);
        if (!subCategory) return res.status(404).json({ message: 'Sub-category not found' });
        let aiResponse: string;
        try {
            aiResponse = await generateAIResponse(
                `Create a detailed professional learning plan and comprehensive lesson about: ${subCategory.name}. Divide it into clear steps.`
            );
        } catch (aiError) {
            console.error('AI Error (Fallback to Mock):', aiError);
            aiResponse =
                `# Lesson: ${subCategory.name}\n\n` +
                `## Step 1: Introduction\nWelcome to ${subCategory.name}. In this part, we will understand the core basics and essential terminology.\n\n` +
                `## Step 2: Deep Dive\nPractical tools, real-world examples, and common methodologies in ${subCategory.name}.\n\n` +
                `## Step 3: Advanced Mastery\nFinal conclusions, optimization techniques, and real-world application.`;
        }
        if (userId) {
            const newPrompt = new Prompt({
                userId,
                categoryId: subCategory.categoryId,
                subCategoryId: subCategory._id,
                prompt: `Learn about ${subCategory.name}`,
                response: aiResponse
            });
            await newPrompt.save();
        }
        res.status(200).json({ topic: subCategory.name, plan: aiResponse });
    } catch (error) {
        console.error('SERVER ERROR:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
