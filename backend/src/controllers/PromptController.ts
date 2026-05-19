import 'dotenv/config';
import { Request, Response } from 'express';
import OpenAI from 'openai';
import Prompt from '../models/Prompt';
import SubCategory from '../models/SubCategory';
import Category from '../models/Category';
import Course from '../models/Course';
import mongoose from 'mongoose';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateLesson = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, categoryId, subCategoryId, prompt } = req.body;
        if (!userId || !categoryId || !subCategoryId || !prompt) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        let subCategoryName = 'General';
        if (mongoose.Types.ObjectId.isValid(subCategoryId)) {
            const subCat = await SubCategory.findById(subCategoryId);
            if (subCat) subCategoryName = subCat.name;
        } else {
            subCategoryName = String(subCategoryId);
        }

        let categoryName = String(categoryId);
        if (mongoose.Types.ObjectId.isValid(categoryId)) {
            const cat = await Category.findById(categoryId);
            if (cat && cat.name) categoryName = cat.name;
        }
        if (!categoryName || categoryName === '[object Object]' || categoryName.trim() === '') {
            categoryName = 'general course';
        }

        let aiResponse = '';
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are an expert private tutor. Always respond in clear Markdown format.' },
                    { role: 'user', content: `I am learning: "${subCategoryName}". Topic: "${prompt}". Generate a comprehensive lesson.` },
                ],
            });
            aiResponse = completion.choices[0].message.content || '';
        } catch (apiError: any) {
            console.log('OpenAI API failure, triggering fallback:', apiError.message);
            aiResponse = `# Lesson: ${prompt}\n\nThis is a simulated lesson for the topic: **${subCategoryName}**.\n\nTo receive live AI responses, ensure your OpenAI API key in \`.env\` is valid and active.`;
        }

        const isValidCategoryId = mongoose.Types.ObjectId.isValid(categoryId);
        const isValidSubCategoryId = mongoose.Types.ObjectId.isValid(subCategoryId);
        const newPrompt = new Prompt({
            userId,
            ...(isValidCategoryId ? { categoryId } : { categoryName: String(categoryId) }),
            ...(isValidSubCategoryId ? { subCategoryId } : { subCategoryName: String(subCategoryId) }),
            prompt,
            response: aiResponse,
        });
        console.log('Saving new prompt to database:', newPrompt);
        await newPrompt.save();

        try {
            const finalCourseTitle = categoryName.trim();
            let course = await Course.findOne({ title: finalCourseTitle, userId });
            if (!course) {
                console.log(`[COURSE SYNC] Course "${finalCourseTitle}" not found. Generating a unique one...`);
                course = new Course({
                    title: finalCourseTitle,
                    description: `All lessons and materials created for course ${finalCourseTitle}`,
                    category: finalCourseTitle,
                    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
                    lessons: [],
                    userId
                });
            }
            const lessonExists = course.lessons.some((l: any) => {
                const lId = l.lessonId || l._id || l;
                return String(lId) === String(newPrompt._id);
            });
            if (newPrompt._id && !lessonExists) {
                course.lessons.push({
                    lessonId: newPrompt._id,
                    title: prompt.trim() || subCategoryName
                } as any);
                course.markModified('lessons');
            }
            const savedCourse = await course.save();
            console.log(`[COURSE SYNC] Successfully saved/updated course: "${savedCourse.title}" with ${savedCourse.lessons.length} lessons.`);
        } catch (courseError: any) {
            console.error('============== COURSE SYNC ERROR ==============');
            console.error('Message:', courseError.message);
            console.error('Full Error Object:', courseError);
            console.error('===============================================');
        }

        res.status(201).json({ message: 'Lesson generated and saved', data: newPrompt });
    } catch (error: any) {
        console.error('Error in generateLesson:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getUserHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const history = await Prompt.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
