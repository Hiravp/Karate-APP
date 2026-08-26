"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppHeader } from "@/components/layout/app-header";

const LINKS = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/assignments", label: "Assignments" },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "teacher") {
      router.replace("/student");
    }
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "teacher") {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink/50">
        Loading teacher portal…
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader links={LINKS} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
