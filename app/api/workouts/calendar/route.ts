// app/api/workouts/calendar/route.ts
// Returns workout and skipped dates for a given month
// Query: ?month=YYYY-MM

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// adjust path if needed
import dbConnect from "@/lib/mongoose";      // adjust path if needed
import Workout from "@/models/Workout";            // adjust path if needed

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // "2026-03"

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 });
    }

    const [year, mon] = month.split("-").map(Number);
    const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(mon).padStart(2, "0")}-${new Date(year, mon, 0).getDate()}`;

    await connectDB();

    // Fetch all workout docs for this user in the given month
    const workouts = await Workout.find({
        userEmail: session.user.email,
        date: { $gte: startDate, $lte: endDate },
    }).select("date skipped exercises").lean();

    const workoutDates: string[] = [];
    const skippedDates: string[] = [];

    for (const w of workouts) {
        if (w.skipped) {
            skippedDates.push(w.date);
        } else if (w.exercises?.length > 0) {
            workoutDates.push(w.date);
        }
    }

    return NextResponse.json({ workoutDates, skippedDates });
}