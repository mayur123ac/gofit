import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    name?: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
