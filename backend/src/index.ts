import express from 'express';
import type { Request, Response } from 'express'; 
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import categoryRoutes from './routes/categoryRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // מאפשר לפרונטנד (React) לדבר עם השרת
app.use(express.json()); // מאפשר לשרת לקרוא מידע בפורמט JSON ב-Body של הבקשות
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

const MongoUri = process.env.MONGO_URI as string;

if (!MongoUri) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(MongoUri)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1); 
    });

app.get('/', (req: Request, res: Response) => {
    res.send('AI Learning Platform API is running successfully...');
});

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});