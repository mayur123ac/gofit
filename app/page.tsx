"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaDumbbell, FaChartLine, FaFire, FaArrowRight } from "react-icons/fa";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero section */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
            <FaFire className="text-orange-400" />
            Your Ultimate Workout Tracker
          </div>

          {/* Title */}
          <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-4">
            <span className="gradient-text">GO</span>
            <span className="text-white"> FIT</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-md mx-auto mb-10 leading-relaxed">
            Track every rep, every set, every gain.
            <br />
            <span className="text-white font-medium">Crush your personal records.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={session ? "/track" : "/login"}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-black font-bold text-lg rounded-2xl hover:bg-green-400 transition-all hover:scale-105 pulse-glow"
            >
              <FaDumbbell />
              {session ? "Go to Tracker" : "Start Tracking Free"}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {session && (
              <Link
                href="/history"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-800 text-white font-bold text-lg rounded-2xl hover:bg-zinc-700 transition-all"
              >
                <FaChartLine />
                View History
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Track Progress Card */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        <Link href={session ? "/track" : "/login"} className="block group">
          <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-2xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FaChartLine className="text-2xl text-green-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Track Progress</h2>
                <p className="text-zinc-500 text-sm">Log today&apos;s exercises, sets, reps & weights</p>
              </div>
              <FaArrowRight className="text-3xl text-zinc-700 group-hover:text-green-400 group-hover:translate-x-2 transition-all" />
            </div>
          </div>
        </Link>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { icon: "💪", title: "Track Sets & Reps", desc: "Log every exercise with precision" },
            { icon: "📈", title: "Progressive Overload", desc: "See +kg and +reps vs last session" },
            { icon: "📅", title: "Workout History", desc: "Review every past workout day" },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
              <p className="text-zinc-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
