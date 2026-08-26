"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const { signUp, user, ready } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(user.role === "teacher" ? "/teacher" : "/student");
  }, [ready, user, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = signUp({ full_name: fullName, email, role });
    if (err) {
      setError(err);
      return;
    }
    router.replace(role === "teacher" ? "/teacher" : "/student");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#d7e3f4,_#f4f7fb_55%)]" />
      <Panel className="w-full max-w-md">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          All-in-One Math Help
        </Link>
        <PanelTitle className="mt-3">Create your account</PanelTitle>
        <p className="mt-1 text-sm text-ink/60">
          Local demo — accounts stay in this browser (no password needed).
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
            />
          </div>
          <div>
            <Label>I am a…</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "teacher"] as UserRole[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={cn(
                    "rounded-md border px-3 py-2.5 text-sm font-semibold capitalize transition",
                    role === option
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 bg-paper text-ink hover:bg-ink/5"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink/60">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-sea-deep hover:underline">
            Sign in
          </Link>
        </p>
      </Panel>
    </main>
  );
}
