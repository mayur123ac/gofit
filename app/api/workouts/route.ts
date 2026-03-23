import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongoose";
import Workout from "@/models/Workout";

function getToday() {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date") || getToday();

        // find user id from email
        const User = (await import("@/models/User")).default;
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const workout = await Workout.findOne({ userId: user._id, date });
        return NextResponse.json({ workout: workout || null });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { date, exercises } = body;
        const workoutDate = date || getToday();

        await dbConnect();
        const User = (await import("@/models/User")).default;
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const workout = await Workout.findOneAndUpdate(
            { userId: user._id, date: workoutDate },
            { $set: { exercises } },
            { new: true, upsert: true }
        );

        return NextResponse.json({ workout });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
