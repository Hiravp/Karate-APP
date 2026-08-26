"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Panel, PanelTitle } from "@/components/ui/panel";

export default function StudentAssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const { store, saveSubmission, user } = useAuth();
  const assignment = useMemo(
    () => store.assignments.find((a) => a.id === params.id),
    [store.assignments, params.id]
  );
  const existing = useMemo(
    () =>
      store.submissions.find(
        (s) => s.assignment_id === params.id && s.student_id === user?.id
      ),
    [store.submissions, params.id, user?.id]
  );

  const [answers, setAnswers] = useState<Record<string, string>>(
    existing?.answers ?? {}
  );
  const [saved, setSaved] = useState(false);

  if (!assignment) {
    return (
      <div className="space-y-3">
        <p>Assignment not found.</p>
        <Link href="/student/assignments" className="text-sea-deep hover:underline">
          Back to assignments
        </Link>
      </div>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    saveSubmission({
      assignment_id: assignment!.id,
      answers,
      ai_feedback: null,
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/student/assignments"
          className="text-sm font-medium text-sea-deep hover:underline"
        >
          ← Assignments
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{assignment.topic}</h1>
        <p className="mt-1 text-sm text-ink/55">
          {assignment.content.length} questions · {assignment.format ?? "Standard"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {assignment.content.map((q, i) => (
          <Panel key={q.id}>
            <PanelTitle className="text-lg">
              Question {i + 1}
              {q.points ? ` · ${q.points} pts` : ""}
            </PanelTitle>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{q.prompt}</p>
            {q.hint && <p className="mt-2 text-xs text-sea-deep">Hint: {q.hint}</p>}
            <Textarea
              className="mt-3"
              placeholder="Show your work…"
              value={answers[q.id] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
            />
          </Panel>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Save answers</Button>
          <Link href="/student/scanner">
            <Button type="button" variant="soft">
              Need help? Open scanner
            </Button>
          </Link>
          {saved && <p className="text-sm text-sea-deep">Saved locally.</p>}
        </div>
      </form>
    </div>
  );
}
