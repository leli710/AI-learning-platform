import { Request, Response } from 'express';
import Course from '../models/Course';

export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        const courses = await Course.find({ userId });
        res.status(200).json(courses);
    } catch (error: any) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses from database' });
    }
};

export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, category, imageUrl, lessons } = req.body;
        if (!title || !description || !category || !imageUrl) {
            return res.status(400).json({ message: 'All main fields are required' });
        }
        const newCourse = new Course({ title, description, category, imageUrl, lessons: lessons || [] });
        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error: any) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Internal server error while creating course' });
    }
};
