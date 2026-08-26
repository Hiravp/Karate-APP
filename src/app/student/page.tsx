"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BookOpen, Gamepad2, ScanLine, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import * as db from "@/lib/demo-store";
import { SUBJECTS } from "@/lib/types";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

export default function StudentHomePage() {
  const { user, store } = useAuth();
  const classes = useMemo(
    () => (user ? db.studentClasses(store, user.id) : []),
    [store, user]
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          Student portal
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
          Ready to practice, {user?.full_name.split(" ")[0]}?
        </h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Join a class, explore subject modules, play quick quizzes, or scan homework for
          tutor-style feedback.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/student/join", label: "Join class", icon: UserPlus, text: "Enter a 6-character code" },
          { href: "/student/assignments", label: "Assignments", icon: BookOpen, text: "Worksheets from your classes" },
          { href: "/student/games", label: "Math games", icon: Gamepad2, text: "Topic-based quizzes" },
          { href: "/student/scanner", label: "AI scanner", icon: ScanLine, text: "Step-by-step homework help" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Panel className="h-full transition group-hover:-translate-y-0.5 group-hover:border-sea/30">
              <item.icon className="h-5 w-5 text-sea-deep" />
              <PanelTitle className="mt-3 text-lg">{item.label}</PanelTitle>
              <p className="mt-1 text-sm text-ink/60">{item.text}</p>
            </Panel>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Your classes</PanelTitle>
          <div className="mt-4 space-y-2">
            {classes.length === 0 && (
              <div className="text-sm text-ink/55">
                <p>You have not joined a class yet.</p>
                <Link href="/student/join" className="mt-3 inline-block">
                  <Button size="sm" variant="soft">
                    Join with class code
                  </Button>
                </Link>
              </div>
            )}
            {classes.map((cls) => {
              const assignments = db.classAssignments(store, cls.id);
              return (
                <div
                  key={cls.id}
                  className="rounded-lg border border-ink/10 bg-mist/35 px-3 py-3 text-sm"
                >
                  <p className="font-semibold">{cls.name}</p>
                  <p className="text-ink/55">
                    Code {cls.class_code} · {assignments.length} assignments
                  </p>
                  {assignments.slice(0, 3).map((a) => (
                    <p key={a.id} className="mt-1 text-ink/70">
                      • {a.topic}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Subject modules</PanelTitle>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SUBJECTS.map((s) => (
              <Link
                key={s.slug}
                href={`/student/subjects/${s.slug}`}
                className="rounded-lg border border-ink/10 px-3 py-2 text-sm transition hover:border-sea/40 hover:bg-sea/5"
              >
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-ink/55">{s.blurb}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
