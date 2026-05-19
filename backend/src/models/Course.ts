import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILesson {
    title: string;
    videoUrl?: string;
    duration?: string;
}

export interface ICourse extends Document {
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    lessons: ILesson[];
    createdAt: Date;
    userId: mongoose.Types.ObjectId;
}

const LessonSchema: Schema = new Schema({
    title: { type: String, required: true },
    videoUrl: { type: String, default: '' },
    duration: { type: String, default: '' }
});

const CourseSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    lessons: [LessonSchema],
    createdAt: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model<ICourse>('Course', CourseSchema);
