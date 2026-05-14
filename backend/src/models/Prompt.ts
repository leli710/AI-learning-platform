import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
    userId: mongoose.Types.ObjectId;      
    categoryId: mongoose.Types.ObjectId;  
    subCategoryId: mongoose.Types.ObjectId; 
    prompt: string; 
    response: string; 
    createdAt: Date;
}

const PromptSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true }
}, { 
    timestamps: true // מנהל אוטומטית את createdAt ו-updatedAt
});

export default mongoose.model<IPrompt>('Prompt', PromptSchema);