"use client";

import type {
  AppUser,
  Assignment,
  AssignmentQuestion,
  ClassRecord,
  DemoStore,
  Enrollment,
  Submission,
  UserRole,
} from "@/lib/types";
import { createId, generateClassCode } from "@/lib/utils";

const STORAGE_KEY = "mathhelp.demo.v1";

function emptyStore(): DemoStore {
  return {
    users: [],
    classes: [],
    enrollments: [],
    assignments: [],
    submissions: [],
    sessionUserId: null,
  };
}

export function loadStore(): DemoStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    return { ...emptyStore(), ...JSON.parse(raw) } as DemoStore;
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: DemoStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getSessionUser(store: DemoStore): AppUser | null {
  if (!store.sessionUserId) return null;
  return store.users.find((u) => u.id === store.sessionUserId) ?? null;
}

export function signUp(
  store: DemoStore,
  input: { full_name: string; email: string; role: UserRole }
): { store: DemoStore; user: AppUser; error?: string } {
  const email = input.email.trim().toLowerCase();
  if (store.users.some((u) => u.email === email)) {
    return { store, user: store.users[0], error: "An account with this email already exists." };
  }
  const user: AppUser = {
    id: createId(),
    full_name: input.full_name.trim(),
    email,
    role: input.role,
  };
  const next: DemoStore = {
    ...store,
    users: [...store.users, user],
    sessionUserId: user.id,
  };
  return { store: next, user };
}

export function signIn(
  store: DemoStore,
  email: string
): { store: DemoStore; user: AppUser | null; error?: string } {
  const normalized = email.trim().toLowerCase();
  const user = store.users.find((u) => u.email === normalized) ?? null;
  if (!user) {
    return { store, user: null, error: "No account found. Please sign up first." };
  }
  return { store: { ...store, sessionUserId: user.id }, user };
}

export function signOut(store: DemoStore): DemoStore {
  return { ...store, sessionUserId: null };
}

export function createClass(
  store: DemoStore,
  teacherId: string,
  name: string
): { store: DemoStore; classRecord: ClassRecord } {
  const existing = new Set(store.classes.map((c) => c.class_code));
  let class_code = generateClassCode();
  while (existing.has(class_code)) class_code = generateClassCode();

  const classRecord: ClassRecord = {
    id: createId(),
    teacher_id: teacherId,
    name: name.trim(),
    class_code,
    created_at: new Date().toISOString(),
  };
  return {
    store: { ...store, classes: [classRecord, ...store.classes] },
    classRecord,
  };
}

export function joinClass(
  store: DemoStore,
  studentId: string,
  code: string
): { store: DemoStore; classRecord?: ClassRecord; error?: string } {
  const class_code = code.trim().toUpperCase();
  const classRecord = store.classes.find((c) => c.class_code === class_code);
  if (!classRecord) {
    return { store, error: "Class code not found. Check with your teacher." };
  }
  const already = store.enrollments.some(
    (e) => e.class_id === classRecord.id && e.student_id === studentId
  );
  if (already) {
    return { store, classRecord, error: "You are already enrolled in this class." };
  }
  const enrollment: Enrollment = {
    class_id: classRecord.id,
    student_id: studentId,
    enrolled_at: new Date().toISOString(),
  };
  return {
    store: { ...store, enrollments: [...store.enrollments, enrollment] },
    classRecord,
  };
}

export function createAssignment(
  store: DemoStore,
  input: {
    class_id: string;
    topic: string;
    content: AssignmentQuestion[];
    format?: string;
  }
): { store: DemoStore; assignment: Assignment } {
  const assignment: Assignment = {
    id: createId(),
    class_id: input.class_id,
    topic: input.topic.trim(),
    content: input.content,
    format: input.format,
    created_at: new Date().toISOString(),
  };
  return {
    store: { ...store, assignments: [assignment, ...store.assignments] },
    assignment,
  };
}

export function saveSubmission(
  store: DemoStore,
  input: {
    assignment_id: string;
    student_id: string;
    answers: Record<string, string>;
    ai_feedback: string | null;
  }
): { store: DemoStore; submission: Submission } {
  const submission: Submission = {
    id: createId(),
    assignment_id: input.assignment_id,
    student_id: input.student_id,
    answers: input.answers,
    ai_feedback: input.ai_feedback,
    created_at: new Date().toISOString(),
  };
  const filtered = store.submissions.filter(
    (s) =>
      !(s.assignment_id === input.assignment_id && s.student_id === input.student_id)
  );
  return {
    store: { ...store, submissions: [submission, ...filtered] },
    submission,
  };
}

export function teacherClasses(store: DemoStore, teacherId: string): ClassRecord[] {
  return store.classes.filter((c) => c.teacher_id === teacherId);
}

export function studentClasses(store: DemoStore, studentId: string): ClassRecord[] {
  const ids = new Set(
    store.enrollments.filter((e) => e.student_id === studentId).map((e) => e.class_id)
  );
  return store.classes.filter((c) => ids.has(c.id));
}

export function classEnrollments(store: DemoStore, classId: string) {
  return store.enrollments
    .filter((e) => e.class_id === classId)
    .map((e) => ({
      ...e,
      student: store.users.find((u) => u.id === e.student_id) ?? null,
    }));
}

export function classAssignments(store: DemoStore, classId: string): Assignment[] {
  return store.assignments.filter((a) => a.class_id === classId);
}
