"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SUBJECTS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Panel, PanelTitle } from "@/components/ui/panel";

const TOPIC_BANK: Record<string, string[]> = {
  algebra: ["Linear equations", "Systems of equations", "Inequalities", "Absolute value"],
  geometry: ["Triangle congruence", "Circle theorems", "Similarity", "Coordinate geometry"],
  "algebra-2": ["Quadratic functions", "Polynomial division", "Rational expressions", "Exponentials"],
  precalculus: ["Unit circle", "Trig identities", "Sequences & series", "Intro limits"],
  calculus: ["Limits & continuity", "Derivatives", "Integrals", "Related rates"],
  "ap-math": ["AP Calc FRQ style", "AP Stats inference", "Series & convergence", "Differential equations"],
  "ib-math": ["IB AA calculus", "IB AI modeling", "Vectors", "Probability distributions"],
};

export default function SubjectDetailPage() {
  const params = useParams<{ subject: string }>();
  const subject = SUBJECTS.find((s) => s.slug === params.subject);

  if (!subject) {
    return (
      <div>
        <p>Subject not found.</p>
        <Link href="/student/subjects">Back</Link>
      </div>
    );
  }

  const topics = TOPIC_BANK[subject.slug] ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/student/subjects" className="text-sm font-medium text-sea-deep hover:underline">
          ← All subjects
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{subject.name}</h1>
        <p className="mt-2 max-w-2xl text-ink/65">{subject.blurb}</p>
      </div>
      <Panel>
        <PanelTitle>Suggested topics</PanelTitle>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {topics.map((topic) => (
            <li
              key={topic}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 px-3 py-2 text-sm"
            >
              <span>{topic}</span>
              <Link href={`/student/games?subject=${subject.slug}&topic=${encodeURIComponent(topic)}`}>
                <Button size="sm" variant="soft">
                  Practice
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel>
        <PanelTitle>Need help on a problem?</PanelTitle>
        <p className="mt-2 text-sm text-ink/60">
          Open the AI Homework Scanner to paste a problem from {subject.name} and get guided
          feedback without a full answer dump.
        </p>
        <Link href={`/student/scanner?subject=${subject.name}`} className="mt-4 inline-block">
          <Button>Open scanner</Button>
        </Link>
      </Panel>
    </div>
  );
}
