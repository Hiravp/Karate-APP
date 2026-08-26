"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Plus, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import * as db from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, PanelTitle } from "@/components/ui/panel";

export default function TeacherDashboardPage() {
  const { user, store, createClass, refresh } = useAuth();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const classes = useMemo(
    () => (user ? db.teacherClasses(store, user.id) : []),
    [store, user]
  );

  function onCreate(e: FormEvent) {
    e.preventDefault();
    const created = createClass(name);
    if (!created) return;
    setName("");
    setMessage(`Created “${created.name}” with code ${created.class_code}`);
    refresh();
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setMessage(`Copied class code ${code}`);
    } catch {
      setMessage(code);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          Teacher portal
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
          Hello, {user?.full_name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Manage classes, share 6-character codes, and open the AI assignment builder.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <PanelTitle>Create a class</PanelTitle>
          <p className="mt-1 text-sm text-ink/60">
            A unique alphanumeric class code is generated automatically.
          </p>
          <form onSubmit={onCreate} className="mt-5 space-y-3">
            <div>
              <Label htmlFor="class-name">Class name</Label>
              <Input
                id="class-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="AP Calculus AB"
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" />
              Create class
            </Button>
          </form>
          {message && <p className="mt-3 text-sm text-sea-deep">{message}</p>}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <PanelTitle>Your classes</PanelTitle>
            <Link href="/teacher/assignments">
              <Button variant="soft" size="sm">
                Assignment builder
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {classes.length === 0 && (
              <p className="text-sm text-ink/55">No classes yet — create your first one.</p>
            )}
            {classes.map((cls) => {
              const roster = db.classEnrollments(store, cls.id);
              const assignments = db.classAssignments(store, cls.id);
              return (
                <div
                  key={cls.id}
                  className="rounded-lg border border-ink/10 bg-mist/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{cls.name}</p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-ink px-3 py-1.5 font-mono text-base tracking-[0.2em] text-accent">
                        {cls.class_code}
                        <button
                          type="button"
                          onClick={() => copyCode(cls.class_code)}
                          className="rounded p-1 text-accent/80 hover:bg-paper/10 hover:text-accent"
                          aria-label="Copy class code"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-ink/50">Share this code with students</p>
                    </div>
                    <div className="text-right text-xs text-ink/55">
                      <p className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {roster.length} enrolled
                      </p>
                      <p className="mt-1">{assignments.length} assignments</p>
                    </div>
                  </div>
                  {roster.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm text-ink/70">
                      {roster.map((row) => (
                        <li key={`${row.class_id}-${row.student_id}`}>
                          {row.student?.full_name ?? "Student"} · {row.student?.email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
