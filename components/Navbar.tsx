"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FaDumbbell } from "react-icons/fa";
import { useState } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaDumbbell className="text-black text-sm" />
                    </div>
                    <span className="text-xl font-black tracking-wider gradient-text">GO FIT</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {session && (
                        <>
                            <Link
                                href="/track"
                                className="text-sm text-zinc-400 hover:text-green-400 transition-colors font-medium"
                            >
                                Track
                            </Link>
                            <Link
                                href="/history"
                                className="text-sm text-zinc-400 hover:text-green-400 transition-colors font-medium"
                            >
                                History
                            </Link>
                        </>
                    )}
                    {status === "loading" ? (
                        <div className="w-20 h-8 bg-zinc-800 rounded-full animate-pulse" />
                    ) : session ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-zinc-500">
                                {session.user?.email?.split("@")[0]}
                            </span>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="px-4 py-2 text-sm bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-5 py-2 text-sm bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all hover:scale-105"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-zinc-400 hover:text-white"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <div className="space-y-1.5">
                        <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </div>
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4 space-y-3">
                    {session && (
                        <>
                            <Link href="/track" className="block text-zinc-300 hover:text-green-400 py-2" onClick={() => setMenuOpen(false)}>
                                Track Workout
                            </Link>
                            <Link href="/history" className="block text-zinc-300 hover:text-green-400 py-2" onClick={() => setMenuOpen(false)}>
                                History
                            </Link>
                        </>
                    )}
                    {session ? (
                        <button
                            onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                            className="w-full text-left text-zinc-400 hover:text-white py-2"
                        >
                            Sign Out ({session.user?.email})
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="block w-full text-center py-3 bg-green-500 text-black font-bold rounded-xl"
                            onClick={() => setMenuOpen(false)}
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
