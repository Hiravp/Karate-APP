export type UserRole = "teacher" | "student";

export interface AppUser {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
}

export interface ClassRecord {
  id: string;
  teacher_id: string;
  name: string;
  class_code: string;
  created_at: string;
}

export interface Enrollment {
  class_id: string;
  student_id: string;
  enrolled_at: string;
}

export interface AssignmentQuestion {
  id: string;
  prompt: string;
  points?: number;
  difficulty?: string;
  hint?: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  topic: string;
  content: AssignmentQuestion[];
  created_at: string;
  format?: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  answers: Record<string, string>;
  ai_feedback: string | null;
  created_at: string;
}

export interface DemoStore {
  users: AppUser[];
  classes: ClassRecord[];
  enrollments: Enrollment[];
  assignments: Assignment[];
  submissions: Submission[];
  sessionUserId: string | null;
}

export const SUBJECTS = [
  { slug: "algebra", name: "Algebra", blurb: "Linear equations, inequalities, and systems." },
  { slug: "geometry", name: "Geometry", blurb: "Proofs, congruence, similarity, and circles." },
  { slug: "algebra-2", name: "Algebra 2", blurb: "Quadratics, polynomials, and rational functions." },
  { slug: "precalculus", name: "Precalculus", blurb: "Trigonometry, sequences, and limits prep." },
  { slug: "calculus", name: "Calculus", blurb: "Derivatives, integrals, and applications." },
  { slug: "ap-math", name: "AP Math", blurb: "AP Calculus & Statistics exam-style practice." },
  { slug: "ib-math", name: "IB Math", blurb: "IB AA/AI HL & SL problem sets." },
] as const;

export type SubjectSlug = (typeof SUBJECTS)[number]["slug"];
