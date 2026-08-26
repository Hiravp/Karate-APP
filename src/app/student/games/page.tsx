"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Suspense } from "react";
import { generateQuizAction } from "@/actions/cerebras";
import { SUBJECTS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type QuizItem = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

function GamesInner() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") ?? "calculus";
  const initialTopic = searchParams.get("topic") ?? "Derivatives";

  const subjectName = useMemo(() => {
    return SUBJECTS.find((s) => s.slug === initialSubject)?.name ?? initialSubject;
  }, [initialSubject]);

  const [subject, setSubject] = useState(subjectName);
  const [topic, setTopic] = useState(initialTopic);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    setSelected({});
    startTransition(async () => {
      const result = await generateQuizAction({ subject, topic });
      if (result.error) {
        setError(result.error);
        setQuiz([]);
        return;
      }
      setQuiz(result.quiz);
    });
  }

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    for (const q of quiz) {
      if (selected[q.id] === q.answerIndex) correct += 1;
    }
    return { correct, total: quiz.length };
  }, [submitted, quiz, selected]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          Math games
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Interactive topic quizzes</h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Generate a short Cerebras-powered quiz for any advanced math topic.
        </p>
      </div>

      <Panel>
        <PanelTitle>Build a round</PanelTitle>
        <form onSubmit={onGenerate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              className="flex h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s.slug} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="accent" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {pending ? "Building quiz…" : "Generate quiz"}
            </Button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Panel>

      {quiz.length > 0 && (
        <Panel>
          <PanelTitle>Play</PanelTitle>
          <div className="mt-4 space-y-5">
            {quiz.map((q, idx) => (
              <div key={q.id} className="border-b border-ink/10 pb-4 last:border-0">
                <p className="font-semibold">
                  {idx + 1}. {q.question}
                </p>
                <div className="mt-2 grid gap-2">
                  {q.choices.map((choice, choiceIdx) => {
                    const isSelected = selected[q.id] === choiceIdx;
                    const isCorrect = submitted && choiceIdx === q.answerIndex;
                    const isWrong = submitted && isSelected && choiceIdx !== q.answerIndex;
                    return (
                      <button
                        key={`${q.id}-${choiceIdx}`}
                        type="button"
                        disabled={submitted}
                        onClick={() =>
                          setSelected((prev) => ({ ...prev, [q.id]: choiceIdx }))
                        }
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-sm transition",
                          isSelected && !submitted && "border-ink bg-ink text-paper",
                          !isSelected && !submitted && "border-ink/15 hover:bg-ink/5",
                          isCorrect && "border-sea bg-sea/15 text-sea-deep",
                          isWrong && "border-red-400 bg-red-50 text-red-700"
                        )}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {!submitted ? (
              <Button onClick={() => setSubmitted(true)}>Check answers</Button>
            ) : (
              <p className="font-semibold text-sea-deep">
                Score: {score?.correct}/{score?.total}
              </p>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="text-sm text-ink/50">Loading games…</div>}>
      <GamesInner />
    </Suspense>
  );
}
