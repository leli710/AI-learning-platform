import { Request, Response } from 'express';
import User from '../models/User.ts';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, name, email, password, phone } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ username, name, email, password, phone });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: { 
                id: newUser._id, 
                username: newUser.username, 
                email: newUser.email 
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};