"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, PanelTitle } from "@/components/ui/panel";

export default function LoginPage() {
  const { signIn, user, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(user.role === "teacher" ? "/teacher" : "/student");
  }, [ready, user, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const err = signIn(email);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#d7e3f4,_#f4f7fb_55%)]" />
      <Panel className="w-full max-w-md">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          All-in-One Math Help
        </Link>
        <PanelTitle className="mt-3">Welcome back</PanelTitle>
        <p className="mt-1 text-sm text-ink/60">
          Sign in with the email you used to create your demo account.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink/60">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-sea-deep hover:underline">
            Create an account
          </Link>
        </p>
      </Panel>
    </main>
  );
}
