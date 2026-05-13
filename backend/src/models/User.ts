import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    phone: { type: String, required: [true, 'Phone number is required'], unique: true, trim: true },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    password: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);