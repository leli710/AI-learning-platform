import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User';
import { isValidIsraeliID } from '../utils/validators';

const createTransporter = () => nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendPasswordResetEmail = async (email: string, token: string) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"AI Learning Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset - AI Learning Platform',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; background: #f9fafb; border-radius: 12px;">
                <h2 style="color: #1d4ed8;">Password Reset</h2>
                <p>We received a request to reset your password on AI Learning Platform.</p>
                <p>Click the button below to choose a new password:</p>
                <a href="${resetLink}" style="display: inline-block; margin-top: 16px; padding: 12px 20px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none;">Reset Password Now</a>
                <p style="margin-top: 24px; font-size: 14px; color: #555;">If you did not request this, you can ignore this email.</p>
            </div>
        `,
    });
};

export const loginOrRegister = async (req: Request, res: Response) => {
    try {
        const { name, phone, identityNumber, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        let user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            if (!name || !phone || !identityNumber) {
                return res.status(400).json({ message: 'All fields (Name, Phone, ID) are required for registration' });
            }
            if (!isValidIsraeliID(identityNumber)) {
                return res.status(400).json({ message: 'Invalid Israeli Identity Number' });
            }
            const existingUser = await User.findOne({ $or: [{ phone }, { identityNumber }] });
            if (existingUser) {
                return res.status(400).json({ message: 'Phone or Identity Number already exists' });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({
                name,
                phone,
                identityNumber,
                email,
                password: hashedPassword,
                isAdmin: false,
                history: []
            });
            await user.save();
        }
        res.status(200).json({
            message: 'Success',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error: any) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json({ success: true, data: users });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ success: true, message: 'If the email is registered, a reset link has been sent.' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = token;
        user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60);
        await user.save();
        await sendPasswordResetEmail(user.email, token);
        res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error: any) {
        console.error('Request password reset error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Email, current password and new password are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
