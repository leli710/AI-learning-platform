import mongoose, { Schema, Document } from 'mongoose';
import { triggerAsyncId } from "node:async_hooks";

export interface ISubcategory extends Document {
    name: string;
    categoryId: mongoose.Types.ObjectId;
}
const SubcategorySchema: Schema = new Schema({
    name: { type: String, required: [true, 'Sub-category name is required'], trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category id is required'] }

});

export default mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);