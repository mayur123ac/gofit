import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongoose";
import Workout from "@/models/Workout";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const exerciseName = searchParams.get("exercise");
        const currentDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

        if (!exerciseName) {
            return NextResponse.json({ error: "exercise query parameter required" }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Find last workout before today that has this exercise
        const workout = await Workout.findOne({
            userId: user._id,
            date: { $lt: currentDate },
            "exercises.name": { $regex: new RegExp(`^${exerciseName}$`, "i") },
        })
            .sort({ date: -1 })
            .lean();

        if (!workout) return NextResponse.json({ lastWorkout: null });

        const exercise = workout.exercises.find(
            (e: { name: string }) => e.name.toLowerCase() === exerciseName.toLowerCase()
        );

        return NextResponse.json({
            lastWorkout: {
                date: workout.date,
                exercise,
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
