import mongoose, { Schema, Document } from 'mongoose';

export interface ISubcategory extends Document {
    name: string;
    categoryId: mongoose.Types.ObjectId;
}

const SubcategorySchema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'Sub-category name is required'], 
        trim: true 
    },
    categoryId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Category', 
        required: [true, 'Category id is required'] 
    }
}, { 
    timestamps: true // מוסיף אוטומטית שדות זמן ליצירה ועדכון
});

export default mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);