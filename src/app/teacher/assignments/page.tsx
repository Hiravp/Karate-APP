"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generateWorksheetAction } from "@/actions/cerebras";
import { useAuth } from "@/lib/auth-context";
import * as db from "@/lib/demo-store";
import type { AssignmentQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, PanelTitle } from "@/components/ui/panel";

export default function TeacherAssignmentsPage() {
  const { user, store, createAssignment } = useAuth();
  const classes = useMemo(
    () => (user ? db.teacherClasses(store, user.id) : []),
    [store, user]
  );

  const [classId, setClassId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<"AP" | "IB" | "Standard">("AP");
  const [subject, setSubject] = useState("Calculus");
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedClassId =
    classId && classes.some((c) => c.id === classId)
      ? classId
      : (classes[0]?.id ?? "");

  function onGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedMsg(null);
    startTransition(async () => {
      const result = await generateWorksheetAction({
        topic,
        subject,
        format,
        questionCount: 5,
      });
      if (result.error) {
        setError(result.error);
        if (result.questions.length === 0) {
          setQuestions([]);
          return;
        }
      }
      setQuestions(result.questions);
    });
  }

  function onSave() {
    if (!selectedClassId || !topic || questions.length === 0) {
      setError("Generate a worksheet and choose a class before saving.");
      return;
    }
    const assignment = createAssignment({
      class_id: selectedClassId,
      topic,
      content: questions,
      format,
    });
    if (assignment) {
      setSavedMsg(`Saved “${assignment.topic}” to the class.`);
      setQuestions([]);
      setTopic("");
      setError(null);
    } else {
      setError("Could not save assignment. Make sure you are signed in as a teacher.");
    }
  }

  const allAssignments = useMemo(() => {
    if (!user) return [];
    return db
      .teacherClasses(store, user.id)
      .flatMap((cls) =>
        db.classAssignments(store, cls.id).map((a) => ({ ...a, className: cls.name }))
      );
  }, [store, user]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          Assignment builder
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">AI Generate worksheets</h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Cerebras creates AP/IB-style free-response questions from a topic. Calls run on the
          server so your API key never reaches the browser.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Generate</PanelTitle>
          <form onSubmit={onGenerate} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="class">Class</Label>
              <select
                id="class"
                className="flex h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm"
                value={selectedClassId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.class_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="AP Calculus AB"
              />
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Integration by Parts"
              />
            </div>
            <div>
              <Label>Format</Label>
              <div className="flex gap-2">
                {(["AP", "IB", "Standard"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                      format === f
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/15 hover:bg-ink/5"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {pending ? "Generating…" : "AI Generate"}
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {savedMsg && <p className="mt-3 text-sm text-sea-deep">{savedMsg}</p>}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <PanelTitle>Preview</PanelTitle>
            <Button size="sm" onClick={onSave} disabled={questions.length === 0}>
              Save assignment
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {questions.length === 0 && (
              <p className="text-sm text-ink/55">
                Generated questions will appear here for review before saving.
              </p>
            )}
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-ink/10 bg-mist/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Question {i + 1}
                  {q.points ? ` · ${q.points} pts` : ""}
                  {q.difficulty ? ` · ${q.difficulty}` : ""}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{q.prompt}</p>
                {q.hint && (
                  <p className="mt-2 text-xs text-sea-deep">Hint: {q.hint}</p>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelTitle>Saved assignments</PanelTitle>
        <div className="mt-4 space-y-2">
          {allAssignments.length === 0 && (
            <p className="text-sm text-ink/55">No assignments saved yet.</p>
          )}
          {allAssignments.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-semibold">{a.topic}</p>
                <p className="text-ink/55">
                  {a.className} · {a.content.length} questions · {a.format ?? "Standard"}
                </p>
              </div>
              <p className="text-xs text-ink/45">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
