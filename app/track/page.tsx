"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaEdit, FaTrash, FaDumbbell } from "react-icons/fa";

// Types
interface ISet {
    reps: number | string;
    weight: number | string;
}

interface IExercise {
    _id?: string;
    name: string;
    sets: ISet[];
}

interface CompareData {
    date: string;
    exercise: { name: string; sets: ISet[] };
}

// Helpers
function todayStr() {
    return new Date().toISOString().split("T")[0];
}

function formatDay(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    return days[d.getDay()];
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// Progress badge helper
function computeProgress(current: ISet[], previous: ISet[]) {
    if (!previous?.length) return null;
    const curMaxWeight = Math.max(...current.map((s) => Number(s.weight) || 0));
    const prevMaxWeight = Math.max(...previous.map((s) => Number(s.weight) || 0));
    const curTotalReps = current.reduce((a, s) => a + (Number(s.reps) || 0), 0);
    const prevTotalReps = previous.reduce((a, s) => a + (Number(s.reps) || 0), 0);
    const weightDiff = curMaxWeight - prevMaxWeight;
    const repsDiff = curTotalReps - prevTotalReps;
    return { weightDiff, repsDiff };
}

// ---- Sub-components ----

function ProgressBadge({ current, compare }: { current: ISet[]; compare: CompareData | null }) {
    if (!compare) return null;
    const p = computeProgress(current, compare.exercise.sets);
    if (!p) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {p.weightDiff !== 0 && (
                <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${p.weightDiff > 0
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                >
                    {p.weightDiff > 0 ? "+" : ""}{p.weightDiff}kg weight
                </span>
            )}
            {p.repsDiff !== 0 && (
                <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${p.repsDiff > 0
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                >
                    {p.repsDiff > 0 ? "+" : ""}{p.repsDiff} total reps
                </span>
            )}
            {p.weightDiff === 0 && p.repsDiff === 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-zinc-800 border-zinc-700 text-zinc-400">
                    Same as last time
                </span>
            )}
        </div>
    );
}

function SetRow({
    index,
    set,
    onChange,
}: {
    index: number;
    set: ISet;
    onChange: (field: "reps" | "weight", v: string) => void;
}) {
    return (
        <div className="grid grid-cols-[40px_1fr_1fr] gap-2 items-center">
            <div className="text-xs font-bold text-zinc-500 text-center">
                S{index + 1}
            </div>
            <div>
                <label className="block text-[10px] text-zinc-600 mb-1 uppercase tracking-wider">Reps</label>
                <input
                    type="number"
                    min={0}
                    value={set.reps}
                    onChange={(e) => onChange("reps", e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm text-center focus:outline-none focus:border-green-500 transition-colors"
                />
            </div>
            <div>
                <label className="block text-[10px] text-zinc-600 mb-1 uppercase tracking-wider">Weight (kg)</label>
                <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={set.weight}
                    onChange={(e) => onChange("weight", e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm text-center focus:outline-none focus:border-green-500 transition-colors"
                />
            </div>
        </div>
    );
}

interface AddExerciseFormProps {
    onSave: (exercise: IExercise) => void;
    onCancel: () => void;
}

function AddExerciseForm({ onSave, onCancel }: AddExerciseFormProps) {
    const [name, setName] = useState("");
    const [numSets, setNumSets] = useState<number | "">("");
    const [sets, setSets] = useState<ISet[]>([]);
    const [compare, setCompare] = useState<CompareData | null>(null);
    const [loadingCompare, setLoadingCompare] = useState(false);

    const generateSets = () => {
        const n = Number(numSets);
        if (!n || n < 1) return;
        setSets(Array.from({ length: n }, () => ({ reps: "", weight: "" })));
    };

    const fetchCompare = useCallback(async (exerciseName: string) => {
        if (!exerciseName.trim()) return;
        setLoadingCompare(true);
        try {
            const res = await fetch(
                `/api/workouts/compare?exercise=${encodeURIComponent(exerciseName)}&date=${todayStr()}`
            );
            const data = await res.json();
            setCompare(data.lastWorkout || null);
        } catch {
            // ignore
        } finally {
            setLoadingCompare(false);
        }
    }, []);

    const updateSet = (i: number, field: "reps" | "weight", v: string) => {
        setSets((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, [field]: v } : s))
        );
    };

    const handleSave = () => {
        if (!name.trim()) { toast.error("Exercise name is required"); return; }
        if (sets.length === 0) { toast.error("Add at least one set"); return; }
        onSave({
            name: name.trim(),
            sets: sets.map((s) => ({ reps: Number(s.reps) || 0, weight: Number(s.weight) || 0 })),
        });
    };

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4 fade-in-up">
            {/* Exercise name */}
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Exercise Name
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => name && fetchCompare(name)}
                        placeholder="e.g. Bench Press, Back Day..."
                        className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
                    />
                </div>
            </div>

            {/* Last workout comparison */}
            {loadingCompare && (
                <div className="text-xs text-zinc-500 animate-pulse">Fetching last workout...</div>
            )}
            {compare && !loadingCompare && (
                <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
                    <p className="text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">
                        Last session – {formatDay(compare.date)} {formatDate(compare.date)}
                    </p>
                    <div className="space-y-1">
                        {compare.exercise.sets.map((s, i) => (
                            <div key={i} className="text-xs text-zinc-400 flex gap-3">
                                <span className="text-zinc-600">Set {i + 1}</span>
                                <span>{s.reps} reps</span>
                                <span>{s.weight} kg</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Number of sets */}
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Number of Sets
                </label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={numSets}
                        onChange={(e) => setNumSets(e.target.value ? Number(e.target.value) : "")}
                        placeholder="3"
                        className="w-24 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm text-center"
                    />
                    <button
                        type="button"
                        onClick={generateSets}
                        className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl hover:border-green-500 hover:text-green-400 transition-all text-sm font-medium"
                    >
                        Generate Sets
                    </button>
                </div>
            </div>

            {/* Set inputs */}
            {sets.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Enter Reps & Weight</p>
                    {sets.map((set, i) => (
                        <SetRow key={i} index={i} set={set} onChange={(f, v) => updateSet(i, f, v)} />
                    ))}
                </div>
            )}

            {/* Progress badge (current vs compare) */}
            {sets.length > 0 && compare && (
                <ProgressBadge current={sets} compare={compare} />
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
                >
                    <FaSave />
                    Save Exercise
                </button>
            </div>
        </div>
    );
}

interface ExerciseCardProps {
    exercise: IExercise;
    index: number;
    onDelete: () => void;
    onEdit: () => void;
}

function ExerciseCard({ exercise, index, onDelete, onEdit }: ExerciseCardProps) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 fade-in-up hover:border-zinc-600 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-xs font-black text-green-400">
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">{exercise.name}</h3>
                        <p className="text-xs text-zinc-500">{exercise.sets.length} sets</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-green-400 hover:bg-zinc-700 transition-all"
                    >
                        <FaEdit className="text-sm" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <FaTrash className="text-sm" />
                    </button>
                </div>
            </div>

            {/* Sets table */}
            <div className="space-y-2">
                <div className="grid grid-cols-3 text-[10px] text-zinc-600 uppercase tracking-wider font-medium px-1">
                    <span>Set</span>
                    <span className="text-center">Reps</span>
                    <span className="text-center">Weight (kg)</span>
                </div>
                {exercise.sets.map((s, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-3 bg-zinc-800 rounded-xl px-3 py-2.5 text-sm"
                    >
                        <span className="text-zinc-500 font-medium">Set {i + 1}</span>
                        <span className="text-center text-white font-bold">{s.reps}</span>
                        <span className="text-center text-green-400 font-bold">{s.weight}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ----- Main Page -----

export default function TrackPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [exercises, setExercises] = useState<IExercise[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const today = todayStr();

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // Load today's workout
    useEffect(() => {
        if (status !== "authenticated") return;
        (async () => {
            try {
                const res = await fetch(`/api/workouts?date=${today}`);
                const data = await res.json();
                if (data.workout?.exercises) {
                    setExercises(data.workout.exercises);
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, [status, today]);

    const saveWorkout = useCallback(async (updatedExercises: IExercise[]) => {
        setSaving(true);
        try {
            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: today, exercises: updatedExercises }),
            });
            if (!res.ok) throw new Error();
            toast.success("Workout saved! 💪");
        } catch {
            toast.error("Failed to save workout");
        } finally {
            setSaving(false);
        }
    }, [today]);

    const handleAddExercise = (exercise: IExercise) => {
        let updated: IExercise[];
        if (editIndex !== null) {
            updated = exercises.map((e, i) => (i === editIndex ? exercise : e));
            setEditIndex(null);
        } else {
            updated = [...exercises, exercise];
        }
        setExercises(updated);
        setShowForm(false);
        saveWorkout(updated);
    };

    const handleDelete = (i: number) => {
        const updated = exercises.filter((_, idx) => idx !== i);
        setExercises(updated);
        saveWorkout(updated);
        toast.success("Exercise removed");
    };

    const handleEdit = (i: number) => {
        setEditIndex(i);
        setShowForm(true);
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                    <p className="text-zinc-500 text-sm">Loading your workout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
            {/* Date header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <FaDumbbell className="text-green-400 text-xl" />
                    <span className="text-green-400 font-black text-sm uppercase tracking-widest">Today</span>
                </div>
                <h1 className="text-4xl font-black text-white">
                    {formatDay(today)}
                </h1>
                <p className="text-zinc-500 text-sm mt-0.5">{formatDate(today)}</p>
            </div>

            {/* Exercises list */}
            {exercises.length > 0 && (
                <div className="space-y-4 mb-6">
                    {exercises.map((ex, i) => (
                        editIndex === i && showForm ? null : (
                            <ExerciseCard
                                key={i}
                                exercise={ex}
                                index={i}
                                onDelete={() => handleDelete(i)}
                                onEdit={() => handleEdit(i)}
                            />
                        )
                    ))}
                </div>
            )}

            {/* Edit form inline */}
            {showForm && editIndex !== null && (
                <div className="mb-4">
                    <AddExerciseForm
                        onSave={handleAddExercise}
                        onCancel={() => { setShowForm(false); setEditIndex(null); }}
                    />
                </div>
            )}

            {/* Add exercise form */}
            {showForm && editIndex === null && (
                <div className="mb-4">
                    <AddExerciseForm
                        onSave={handleAddExercise}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* Add exercise button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-4 border-2 border-dashed border-zinc-700 rounded-2xl text-zinc-400 hover:border-green-500 hover:text-green-400 hover:bg-green-500/5 transition-all flex items-center justify-center gap-3 text-base font-semibold group"
                >
                    <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaPlus className="text-green-400 text-sm" />
                    </div>
                    Add Exercise
                </button>
            )}

            {/* Summary */}
            {exercises.length > 0 && !showForm && (
                <div className="mt-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">
                            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} ·{" "}
                            {exercises.reduce((a, e) => a + e.sets.length, 0)} total sets
                        </span>
                        <button
                            onClick={() => saveWorkout(exercises)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all text-xs disabled:opacity-60"
                        >
                            {saving ? "Saving..." : <><FaSave /> Save All</>}
                        </button>
                    </div>
                </div>
            )}

            {exercises.length === 0 && !showForm && (
                <div className="mt-8 text-center">
                    <div className="text-5xl mb-4">🏋️</div>
                    <p className="text-zinc-500 text-sm">No exercises yet today.</p>
                    <p className="text-zinc-600 text-xs">Tap &quot;Add Exercise&quot; to start logging!</p>
                </div>
            )}
        </div>
    );
}
