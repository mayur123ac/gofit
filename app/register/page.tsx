"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaDumbbell, FaEnvelope, FaLock, FaUser } from "react-icons/fa";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            toast.success("Account created! Please sign in.");
            router.push("/login");
        } else {
            toast.error(data.error || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-green-500/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 mb-4">
                        <FaDumbbell className="text-3xl text-green-400" />
                    </div>
                    <h1 className="text-3xl font-black gradient-text">GO FIT</h1>
                    <p className="text-zinc-500 text-sm mt-1">Create your free account</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Name</label>
                            <div className="relative">
                                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full pl-10 pr-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-green-500 text-black font-bold text-base rounded-xl hover:bg-green-400 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 mt-2"
                        >
                            {loading ? "Creating account..." : "Create Account 🚀"}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-zinc-500 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-green-400 font-medium hover:text-green-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
