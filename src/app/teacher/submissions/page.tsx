"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import * as db from "@/lib/demo-store";
import { Panel, PanelTitle } from "@/components/ui/panel";

export default function TeacherSubmissionsPage() {
  const { user, store } = useAuth();
  const rows = useMemo(
    () => (user ? db.teacherSubmissions(store, user.id) : []),
    [store, user]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          Submissions
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Student work & AI feedback</h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Answers and Cerebras tutor feedback from enrolled students (local demo store).
        </p>
      </div>

      <Panel>
        <PanelTitle>Recent submissions</PanelTitle>
        <div className="mt-4 space-y-3">
          {rows.length === 0 && (
            <p className="text-sm text-ink/55">
              No submissions yet. Students save answers from{" "}
              <Link href="/teacher/assignments" className="font-semibold text-sea-deep hover:underline">
                your assignments
              </Link>
              .
            </p>
          )}
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-ink/10 bg-mist/30 px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{row.assignment.topic}</p>
                  <p className="text-ink/55">
                    {row.className} · {row.student?.full_name ?? "Student"} ·{" "}
                    {row.student?.email}
                  </p>
                </div>
                <p className="text-xs text-ink/45">
                  {new Date(row.created_at).toLocaleString()}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                {Object.entries(row.answers).map(([qid, answer]) => (
                  <div key={qid}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                      {qid}
                    </p>
                    <p className="whitespace-pre-wrap text-ink/80">{answer || "(blank)"}</p>
                  </div>
                ))}
              </div>
              {row.ai_feedback && (
                <div className="mt-3 rounded-md border border-sea/20 bg-sea/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sea-deep">
                    AI feedback
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-ink/80">{row.ai_feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
