"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import * as db from "@/lib/demo-store";
import { Panel, PanelTitle } from "@/components/ui/panel";

export default function StudentAssignmentsPage() {
  const { user, store } = useAuth();
  const rows = useMemo(() => {
    if (!user) return [];
    return db.studentClasses(store, user.id).flatMap((cls) =>
      db.classAssignments(store, cls.id).map((a) => ({
        ...a,
        className: cls.name,
        classCode: cls.class_code,
      }))
    );
  }, [store, user]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          Assignments
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Your worksheets</h1>
        <p className="mt-2 text-ink/65">
          Assignments from classes you joined. Use the scanner if you need step-by-step help.
        </p>
      </div>
      <Panel>
        <PanelTitle>Assigned work</PanelTitle>
        <div className="mt-4 space-y-3">
          {rows.length === 0 && (
            <p className="text-sm text-ink/55">
              No assignments yet.{" "}
              <Link href="/student/join" className="font-semibold text-sea-deep hover:underline">
                Join a class
              </Link>{" "}
              after your teacher generates one.
            </p>
          )}
          {rows.map((a) => (
            <Link
              key={a.id}
              href={`/student/assignments/${a.id}`}
              className="block rounded-lg border border-ink/10 px-4 py-3 transition hover:border-sea/40 hover:bg-sea/5"
            >
              <p className="font-semibold text-ink">{a.topic}</p>
              <p className="text-sm text-ink/55">
                {a.className} · {a.content.length} questions · {a.format ?? "Standard"}
              </p>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
