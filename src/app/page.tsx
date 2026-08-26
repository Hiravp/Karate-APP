"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ScanLine, Sparkles, Users } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
export default function HomePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(user.role === "teacher" ? "/teacher" : "/student");
  }, [ready, user, router]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative min-h-[100svh] overflow-hidden math-glow text-paper">
        <div className="hero-grid absolute inset-0 opacity-70" aria-hidden />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-between px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex items-center justify-between animate-rise">
            <p className="font-display text-2xl tracking-tight sm:text-3xl">
              All-in-One Math Help
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-paper/70 transition hover:text-paper"
            >
              Sign in
            </Link>
          </div>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="animate-rise font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Advanced math tutoring that teaches the{" "}
                <span className="text-accent">why</span>, not just the answer.
              </h1>
              <p className="animate-rise-delay mt-5 max-w-xl text-lg text-paper/75 sm:text-xl">
                Teachers build AI worksheets. Students join classes, practice AP/IB
                topics, and scan homework for supportive step-by-step guidance.
              </p>
              <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-accent px-7 text-base font-semibold text-ink transition hover:bg-accent-bright"
                >
                  Get started locally
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center rounded-md border border-paper/25 px-7 text-base font-semibold text-paper transition hover:bg-paper/10"
                >
                  I already have an account
                </Link>
              </div>
              <p className="animate-rise-delay-2 mt-4 max-w-lg text-sm text-paper/55">
                Runs fully in your browser for auth/classes. AI calls go through Next.js
                server actions. Supabase and Vercel can be connected later.
              </p>
            </div>

            <div className="relative animate-drift" aria-hidden>
              <svg
                viewBox="0 0 520 420"
                className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
              >
                <rect
                  x="24"
                  y="28"
                  width="472"
                  height="360"
                  rx="28"
                  fill="#12233d"
                  stroke="rgba(244,247,251,0.12)"
                />
                <path
                  d="M70 290 C140 260, 170 180, 230 170 S330 210, 380 120"
                  fill="none"
                  stroke="#f0b429"
                  strokeWidth="4"
                  className="curve-draw"
                />
                <circle cx="230" cy="170" r="7" fill="#2a9d8f" />
                <circle cx="380" cy="120" r="7" fill="#f0b429" />
                <text x="70" y="90" fill="#d7e3f4" fontSize="22" fontFamily="ui-monospace, monospace">
                  ∫ f(x) dx · Δy/Δx · △ABC
                </text>
                <text x="70" y="340" fill="rgba(244,247,251,0.55)" fontSize="16">
                  Algebra → Geometry → Calculus → AP / IB
                </text>
              </svg>
            </div>
          </div>

          <div className="grid gap-4 border-t border-paper/10 pt-6 sm:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Teacher portal",
                text: "Class codes, rosters, and AI assignment builder.",
              },
              {
                icon: ScanLine,
                title: "Homework scanner",
                text: "Upload or type work. Get guided corrections.",
              },
              {
                icon: Sparkles,
                title: "Powered by Cerebras",
                text: "Fast worksheet and tutor generation on the server.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 text-sm text-paper/70">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="font-semibold text-paper">{item.title}</p>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
