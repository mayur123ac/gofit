"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaChevronDown, FaChevronUp, FaCalendarAlt, FaDumbbell } from "react-icons/fa";

interface ISet { reps: number; weight: number; }
interface IExercise { name: string; sets: ISet[]; }
interface IWorkout { _id: string; date: string; exercises: IExercise[]; }

function formatDay(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[d.getDay()].toUpperCase();
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        (async () => {
            try {
                const res = await fetch("/api/workouts/history");
                const data = await res.json();
                setWorkouts(data.workouts || []);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        })();
    }, [status]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                    <p className="text-zinc-500 text-sm">Loading history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <FaCalendarAlt className="text-green-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">Workout History</h1>
                    <p className="text-zinc-500 text-xs">{workouts.length} workout{workouts.length !== 1 ? "s" : ""} logged</p>
                </div>
            </div>

            {workouts.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-zinc-500 text-sm">No workouts yet.</p>
                    <p className="text-zinc-600 text-xs mt-1">Start tracking on the Track page!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {workouts.map((w) => {
                        const isOpen = expanded === w._id;
                        const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
                        return (
                            <div
                                key={w._id}
                                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all"
                            >
                                {/* Header row */}
                                <button
                                    onClick={() => setExpanded(isOpen ? null : w._id)}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                                            <FaDumbbell className="text-green-400 text-sm" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {formatDay(w.date)} <span className="text-zinc-500 font-normal">({formatDate(w.date)})</span>
                                            </p>
                                            <p className="text-xs text-zinc-600 mt-0.5">
                                                {w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""} · {totalSets} sets
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-600 hidden sm:block">
                                            {w.exercises.map(e => e.name).join(", ").substring(0, 30)}{w.exercises.map(e => e.name).join(", ").length > 30 ? "..." : ""}
                                        </span>
                                        {isOpen ? (
                                            <FaChevronUp className="text-zinc-500" />
                                        ) : (
                                            <FaChevronDown className="text-zinc-500" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded detail */}
                                {isOpen && (
                                    <div className="px-4 pb-4 space-y-4 border-t border-zinc-800">
                                        {w.exercises.map((ex, i) => (
                                            <div key={i} className="mt-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center text-[10px] font-black text-green-400">
                                                        {i + 1}
                                                    </div>
                                                    <span className="font-bold text-white text-sm">{ex.name}</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="grid grid-cols-3 text-[10px] text-zinc-600 uppercase tracking-wider font-medium px-2">
                                                        <span>Set</span><span className="text-center">Reps</span><span className="text-center">Weight</span>
                                                    </div>
                                                    {ex.sets.map((s, j) => (
                                                        <div key={j} className="grid grid-cols-3 bg-zinc-800 rounded-xl px-3 py-2 text-sm">
                                                            <span className="text-zinc-500">Set {j + 1}</span>
                                                            <span className="text-center text-white font-bold">{s.reps}</span>
                                                            <span className="text-center text-green-400 font-bold">{s.weight} kg</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
