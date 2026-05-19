import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export const sendLessonEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, lessonTitle, lessonContent } = req.body;
        if (!email || !lessonTitle || !lessonContent) {
            res.status(400).json({ message: 'email, lessonTitle and lessonContent are required' });
            return;
        }
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: `"AI Learning Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `📚 Your Lesson: ${lessonTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #2b6cb0; margin-bottom: 5px;">Hi! 👋</h2>
                    <p style="font-size: 16px; color: #4a5568;">Here is the lesson you just generated on the AI Learning Platform.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0 20px;"/>
                    <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; border-right: 4px solid #2b6cb0; font-size: 15px; color: #2d3748;">
                        ${lessonContent.replace(/\n/g, '<br>')}
                    </div>
                    <footer style="margin-top: 30px; font-size: 12px; color: #a0aec0; text-align: center;">
                        Sent automatically by your AI Learning Platform. Good luck!
                    </footer>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Lesson sent to email successfully!' });
    } catch (error: any) {
        console.error('Email error:', error);
        res.status(500).json({ message: 'Error sending email', error: error.message });
    }
};

