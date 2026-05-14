import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  identityNumber: string;
  email: string;
  password: string;
  history: any[]; 
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  identityNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  history: { type: Array, default: [] } // הגדרת ברירת מחדל כמערך ריק
});

export default mongoose.model<IUser>('User', UserSchema);