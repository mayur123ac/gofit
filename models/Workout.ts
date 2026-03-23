import mongoose, { Document, Schema } from "mongoose";

export interface ISet {
    reps: number;
    weight: number;
}

export interface IExercise {
    _id?: string;
    name: string;
    sets: ISet[];
}

export interface IWorkout extends Document {
    userId: mongoose.Types.ObjectId;
    date: string; // "YYYY-MM-DD"
    exercises: IExercise[];
    createdAt: Date;
    updatedAt: Date;
}

const SetSchema = new Schema<ISet>({
    reps: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
});

const ExerciseSchema = new Schema<IExercise>({
    name: { type: String, required: true, trim: true },
    sets: { type: [SetSchema], default: [] },
});

const WorkoutSchema = new Schema<IWorkout>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: String, required: true }, // e.g. "2026-03-23"
        exercises: { type: [ExerciseSchema], default: [] },
    },
    { timestamps: true }
);

// Unique workout per user per day
WorkoutSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Workout ||
    mongoose.model<IWorkout>("Workout", WorkoutSchema);
