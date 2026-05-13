import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
    userId: mongoose.Types.ObjectId;      
    categoryId: mongoose.Types.ObjectId;  
    subCategoryId: mongoose.Types.ObjectId; 
    promptText: string;                  
    aiResponse: string;                
    createdAt: Date;
}

const PromptSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    promptText: { type: String, required: true },
    aiResponse: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPrompt>('Prompt', PromptSchema);