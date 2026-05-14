import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { isValidIsraeliID } from '../utils/validators';

export const loginOrRegister = async (req: Request, res: Response) => {
    try {
        const { name, phone, identityNumber, email, password } = req.body;

        if (!name || !phone || !identityNumber || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // אימות תקינות מספר זהות ישראלי
        if (!isValidIsraeliID(identityNumber)) {
            return res.status(400).json({ message: 'Invalid Israeli Identity Number' });
        }

        let user = await User.findOne({ 
            $or: [{ phone }, { identityNumber }, { email }] 
        });

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name,
                phone,
                identityNumber,
                email,
                password: hashedPassword,
                history: [] 
            });
            await user.save();
        }

        res.status(200).json({
            message: 'Success',
            user: { 
                id: user._id, 
                name: user.name,
                email: user.email 
            }
        });

    } catch (error: any) {
        console.error("Auth error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserHistory = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            userId: user._id,
            history: user.history || [] 
        });

    } catch (error: any) {
        console.error("Fetch history error:", error);
        res.status(500).json({ message: 'Error fetching user history' });
    }
};