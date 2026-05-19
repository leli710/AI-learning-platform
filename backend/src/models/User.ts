import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    phone: string;
    identityNumber: string;
    email: string;
    password: string;
    isAdmin: boolean;
    history: any[];
    passwordResetToken?: string;
    passwordResetExpires?: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    identityNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    history: { type: Array, default: [] },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date }
});

export default mongoose.model<IUser>('User', UserSchema);
