"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, PanelTitle } from "@/components/ui/panel";

export default function JoinClassPage() {
  const { joinClass } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const result = joinClass(code);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(`Joined ${result.classRecord?.name ?? "class"}!`);
    setCode("");
    setTimeout(() => router.push("/student"), 700);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          Join class
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Enter your class code</h1>
        <p className="mt-2 text-ink/65">
          Ask your teacher for the 6-character code generated when they created the class.
        </p>
      </div>
      <Panel>
        <PanelTitle>Class code</PanelTitle>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AB12CD"
              className="font-mono text-lg tracking-[0.3em]"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-sea-deep">{success}</p>}
          <Button type="submit" className="w-full">
            Join roster
          </Button>
        </form>
      </Panel>
    </div>
  );
}
