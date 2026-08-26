"use client";

import Link from "next/link";
import { SUBJECTS } from "@/lib/types";
import { Panel, PanelTitle } from "@/components/ui/panel";

export default function SubjectsIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea-deep">
          Subject modules
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Choose a path</h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Navigate Algebra through IB Math for focused practice prompts and study tips.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map((s) => (
          <Link key={s.slug} href={`/student/subjects/${s.slug}`}>
            <Panel className="h-full transition hover:-translate-y-0.5 hover:border-sea/30">
              <PanelTitle className="text-xl">{s.name}</PanelTitle>
              <p className="mt-2 text-sm text-ink/60">{s.blurb}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
