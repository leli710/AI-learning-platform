import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
}

const CategorySchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model<ICategory>('Category', CategorySchema);
