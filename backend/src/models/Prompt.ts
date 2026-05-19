import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
    userId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    subCategoryId: mongoose.Types.ObjectId;
    categoryName?: string;
    subCategoryName?: string;
    prompt: string;
    response: string;
    createdAt: Date;
}

const PromptSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'Subcategory' },
    categoryName: { type: String },
    subCategoryName: { type: String },
    prompt: { type: String, required: true },
    response: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<IPrompt>('Prompt', PromptSchema);
