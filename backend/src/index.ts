import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import categoryRoutes from './routes/categoryRoutes';
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import promptRoutes from './routes/promptRoutes';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/prompts', promptRoutes);

const MongoUri = process.env.MONGO_URI as string;
if (!MongoUri) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in .env file');
    process.exit(1);
}

app.get('/', (req: Request, res: Response) => {
    res.send('AI Learning Platform API is running successfully...');
});

mongoose.connect(MongoUri)
    .then(() => {
        console.log('Connected to MongoDB successfully!');
        app.listen(PORT, () => {
            console.log(`Server is running on: http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1);
    });
