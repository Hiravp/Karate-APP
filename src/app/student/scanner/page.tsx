"use client";

import { FormEvent, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ScanLine, Upload } from "lucide-react";
import { scanHomeworkAction } from "@/actions/cerebras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel, PanelTitle } from "@/components/ui/panel";

function mockOcrFromFilename(file: File): string {
  const name = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
  return `[Mock OCR from image “${file.name}”]
Problem (inferred): ${name || "Uploaded homework problem"}
Student work:
1) Started with the given equation / diagram.
2) Attempted the next algebraic or calculus step.
3) Arrived at a candidate answer (details unclear from image).

Note: OCR is mocked for this demo. Paste clearer work below if needed.`;
}

function ScannerInner() {
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get("subject") ?? "Calculus");
  const [problemText, setProblemText] = useState("");
  const [studentWork, setStudentWork] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    const extracted = mockOcrFromFilename(file);
    setStudentWork((prev) => (prev ? `${prev}\n\n${extracted}` : extracted));
    if (!problemText) {
      setProblemText(`Problem from uploaded homework image (${file.name}).`);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFeedback("");
    startTransition(async () => {
      const result = await scanHomeworkAction({
        problemText,
        studentWork,
        subject,
      });
      if (result.error) {
        setError(result.error);
        if (!result.feedback) return;
      }
      setFeedback(result.feedback);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          AI homework scanner
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Supportive step-by-step review</h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Upload an image (mock OCR) or type the problem and your work. Cerebras acts as a tutor:
          it highlights the error and guides you forward without handing over the final answer.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Submit work</PanelTitle>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="upload">Homework image (optional)</Label>
              <label
                htmlFor="upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink/20 bg-mist/30 px-4 py-8 text-center transition hover:border-sea/40"
              >
                <Upload className="h-5 w-5 text-sea-deep" />
                <span className="mt-2 text-sm text-ink/70">
                  {fileName ? fileName : "Click to upload PNG/JPG"}
                </span>
                <input
                  id="upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div>
              <Label htmlFor="problem">Problem statement</Label>
              <Textarea
                id="problem"
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="e.g. Evaluate ∫ x e^x dx using integration by parts."
              />
            </div>
            <div>
              <Label htmlFor="work">Your work</Label>
              <Textarea
                id="work"
                value={studentWork}
                onChange={(e) => setStudentWork(e.target.value)}
                placeholder="Paste or type your steps…"
                className="min-h-[160px]"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="h-4 w-4" />
              )}
              {pending ? "Scanning…" : "Scan with Cerebras"}
            </Button>
          </form>
        </Panel>

        <Panel className="min-h-[320px]">
          <PanelTitle>Tutor feedback</PanelTitle>
          {!feedback && !pending && (
            <p className="mt-4 text-sm text-ink/55">
              Feedback will appear here after you scan. Expect a supportive review that checks
              each step and points to the first error.
            </p>
          )}
          {pending && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Reviewing your work…
            </p>
          )}
          {feedback && (
            <div className="mt-4 whitespace-pre-wrap rounded-lg border border-ink/10 bg-mist/30 p-4 text-sm leading-relaxed text-ink">
              {feedback}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={<div className="text-sm text-ink/50">Loading scanner…</div>}>
      <ScannerInner />
    </Suspense>
  );
}
