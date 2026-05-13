import express from 'express';
import type { Request, Response } from 'express'; // שימוש ב-import type הוא הסטנדרט הכי גבוה ב-TS
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import categoryRoutes from './routes/categoryRoutes';
import userRoutes from './routes/userRoutes.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// חיבור לבסיס נתונים (MongoDB)
const MongoUri = process.env.MONGO_URI as string;
if (!MongoUri) {
    console.error('Error: MONGO_URI is not defined in .env file');
    process.exit(1);
}
mongoose.connect(MongoUri)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((error) => console.error('Failed to connect to MongoDB:', error.message));
// נתיב בדיקה בסיסי
app.get('/', (req: Request, res: Response) => {
    res.send('AI Learning Platform API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});