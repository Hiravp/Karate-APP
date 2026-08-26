"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  AppUser,
  Assignment,
  AssignmentQuestion,
  ClassRecord,
  DemoStore,
  UserRole,
} from "@/lib/types";
import * as db from "@/lib/demo-store";

interface AuthContextValue {
  ready: boolean;
  user: AppUser | null;
  store: DemoStore;
  refresh: () => void;
  resetDemoData: () => void;
  signUp: (input: { full_name: string; email: string; role: UserRole }) => string | null;
  signIn: (email: string) => string | null;
  signOut: () => void;
  createClass: (name: string) => ClassRecord | null;
  joinClass: (code: string) => { classRecord?: ClassRecord; error?: string };
  createAssignment: (input: {
    class_id: string;
    topic: string;
    content: AssignmentQuestion[];
    format?: string;
  }) => Assignment | null;
  saveSubmission: (input: {
    assignment_id: string;
    answers: Record<string, string>;
    ai_feedback: string | null;
  }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const empty: DemoStore = {
  users: [],
  classes: [],
  enrollments: [],
  assignments: [],
  submissions: [],
  sessionUserId: null,
};

let memoryStore: DemoStore = empty;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DemoStore {
  return memoryStore;
}

function getServerSnapshot(): DemoStore {
  return empty;
}

function writeStore(next: DemoStore) {
  memoryStore = next;
  db.saveStore(next);
  emit();
}

function ensureBootstrapped() {
  if (typeof window === "undefined") return;
  if ((ensureBootstrapped as { done?: boolean }).done) return;
  memoryStore = db.loadStore();
  (ensureBootstrapped as { done?: boolean }).done = true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  ensureBootstrapped();
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const persist = useCallback((next: DemoStore) => {
    writeStore(next);
  }, []);

  const user = useMemo(() => db.getSessionUser(store), [store]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      store,
      refresh: () => {
        memoryStore = db.loadStore();
        emit();
      },
      resetDemoData: () => writeStore({ ...empty }),
      signUp: (input) => {
        const result = db.signUp(store, input);
        if (result.error) return result.error;
        persist(result.store);
        return null;
      },
      signIn: (email) => {
        const result = db.signIn(store, email);
        if (result.error) return result.error;
        persist(result.store);
        return null;
      },
      signOut: () => persist(db.signOut(store)),
      createClass: (name) => {
        if (!user || user.role !== "teacher") return null;
        const result = db.createClass(store, user.id, name);
        persist(result.store);
        return result.classRecord;
      },
      joinClass: (code) => {
        if (!user || user.role !== "student") {
          return { error: "Only students can join classes." };
        }
        const result = db.joinClass(store, user.id, code);
        if (!result.error && result.classRecord) persist(result.store);
        return { classRecord: result.classRecord, error: result.error };
      },
      createAssignment: (input) => {
        if (!user || user.role !== "teacher") return null;
        const result = db.createAssignment(store, input);
        persist(result.store);
        return result.assignment;
      },
      saveSubmission: (input) => {
        if (!user || user.role !== "student") return;
        const result = db.saveSubmission(store, {
          ...input,
          student_id: user.id,
        });
        persist(result.store);
      },
    }),
    [ready, user, store, persist]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
