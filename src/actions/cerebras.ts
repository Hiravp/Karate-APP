"use server";

import Cerebras from "@cerebras/cerebras_cloud_sdk";
import type { AssignmentQuestion } from "@/lib/types";

/** Prefer env override; default to a model available on typical Cerebras free/test keys. */
const DEFAULT_MODEL = process.env.CEREBRAS_MODEL ?? "gemma-4-31b";

function getClient() {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    throw new Error("CEREBRAS_API_KEY is not configured on the server.");
  }
  return new Cerebras({ apiKey });
}

function extractText(completion: unknown): string {
  const c = completion as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  return c.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseQuestions(raw: string): AssignmentQuestion[] {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = (fenced?.[1] ?? raw).trim();
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { questions?: unknown }).questions)
        ? (parsed as { questions: unknown[] }).questions
        : null;
    if (!list) throw new Error("No questions array");
    return list.map((item, index) => {
      const q = item as Partial<AssignmentQuestion> & { question?: string };
      return {
        id: q.id ?? `q${index + 1}`,
        prompt: q.prompt ?? q.question ?? String(item),
        points: q.points ?? 4,
        difficulty: q.difficulty ?? "medium",
        hint: q.hint,
      };
    });
  } catch {
    return [
      {
        id: "q1",
        prompt: raw || "Solve the following problem and show all work.",
        points: 4,
        difficulty: "medium",
      },
    ];
  }
}

function fallbackWorksheet(
  topic: string,
  format: string,
  count: number
): AssignmentQuestion[] {
  const templates = [
    `Explain the key idea behind ${topic} in your own words, then solve a related example with complete justification (${format} style).`,
    `A student claims a shortcut for ${topic}. Critique the claim and either prove it or provide a counterexample.`,
    `Solve a multi-step free-response problem involving ${topic}. Show every algebraic step and state any theorem you use.`,
    `Create a diagram or structured outline that models ${topic}, then use it to answer a quantitative follow-up.`,
    `Given incomplete student work on ${topic}, identify the first error and finish the solution correctly.`,
    `Compare two approaches to ${topic}. Which is more efficient for exam conditions, and why?`,
    `Write and solve an original application problem that requires ${topic}.`,
    `Prove or derive a core identity/result related to ${topic}, then apply it once.`,
  ];
  return templates.slice(0, count).map((prompt, i) => ({
    id: `q${i + 1}`,
    prompt,
    points: i === 0 ? 3 : 4,
    difficulty: i < 2 ? "medium" : "hard",
    hint: `Focus on definitions and the first transformation step for ${topic}.`,
  }));
}

function fallbackTutorFeedback(problemText: string, studentWork: string): string {
  return `Supportive review (offline demo mode)

Problem focus:
${problemText || "(inferred from work)"}

What looks strong
1. You started the problem and recorded steps — that already helps a tutor spot the first fork in the road.

Where to look next
2. Compare each step to the governing rule (definition, identity, derivative/integral rule, or theorem). The first place a rule is misapplied is usually the key error.
3. Ask yourself: “What quantity am I solving for, and did my last line still represent that quantity?”

Guided next step
4. Rewrite the step after your setup using one carefully chosen identity or rule.
5. Check units/domain (especially for logs, radicals, trig, and calculus constraints).
6. Only after the corrected middle step checks out should you finish the algebra.

Student work snapshot
${studentWork || "(none provided)"}

I am not giving the final answer here on purpose — rework the middle step and re-scan when you are ready.`;
}

function fallbackQuiz(subject: string, topic: string) {
  return [
    {
      id: "1",
      question: `In ${subject}, which statement best describes ${topic}?`,
      choices: [
        "A definition with no computational use",
        "A core concept used to solve related problems",
        "Only relevant for geometry proofs",
        "Never assessed on AP/IB exams",
      ],
      answerIndex: 1,
    },
    {
      id: "2",
      question: `When applying ${topic}, what should you do first?`,
      choices: [
        "Guess the final answer",
        "Skip to calculator output",
        "Identify knowns, unknowns, and the governing rule",
        "Erase all intermediate steps",
      ],
      answerIndex: 2,
    },
    {
      id: "3",
      question: `A common error with ${topic} is:`,
      choices: [
        "Writing clear justifications",
        "Checking domain restrictions",
        "Misapplying the first transformation rule",
        "Labeling diagrams carefully",
      ],
      answerIndex: 2,
    },
    {
      id: "4",
      question: `Best exam strategy for ${topic}?`,
      choices: [
        "Show structure, then compute carefully",
        "Only write the final box",
        "Avoid units and conditions",
        "Ignore partial credit opportunities",
      ],
      answerIndex: 0,
    },
  ];
}

export async function generateWorksheetAction(input: {
  topic: string;
  subject?: string;
  format?: "AP" | "IB" | "Standard";
  questionCount?: number;
}): Promise<{
  questions: AssignmentQuestion[];
  raw: string;
  error?: string;
  source?: "cerebras" | "fallback";
}> {
  const topic = input.topic.trim();
  if (!topic) return { questions: [], raw: "", error: "Topic is required." };

  const count = Math.min(Math.max(input.questionCount ?? 5, 3), 8);
  const format = input.format ?? "AP";
  const subject = input.subject ?? "advanced high school mathematics";

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.4,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content:
            "You are an expert secondary math curriculum designer. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Create a ${format}-style worksheet for ${subject} on the topic "${topic}".
Return JSON with this shape:
{
  "questions": [
    {
      "id": "q1",
      "prompt": "full problem statement students will see",
      "points": 4,
      "difficulty": "easy|medium|hard",
      "hint": "short optional scaffold, not the answer"
    }
  ]
}
Requirements:
- Exactly ${count} questions
- Free-response / show-your-work style (not multiple choice)
- Match ${format} exam tone and rigor
- No answer key in the JSON`,
        },
      ],
    });

    const raw = extractText(completion);
    return { questions: parseQuestions(raw), raw, source: "cerebras" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cerebras request failed.";
    const questions = fallbackWorksheet(topic, format, count);
    return {
      questions,
      raw: JSON.stringify({ questions }),
      error: `Cerebras unavailable (${message}). Showing offline demo worksheet.`,
      source: "fallback",
    };
  }
}

export async function scanHomeworkAction(input: {
  problemText: string;
  studentWork: string;
  subject?: string;
}): Promise<{ feedback: string; error?: string; source?: "cerebras" | "fallback" }> {
  const problemText = input.problemText.trim();
  const studentWork = input.studentWork.trim();
  if (!problemText && !studentWork) {
    return { feedback: "", error: "Provide a problem and/or student work to scan." };
  }

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.3,
      max_tokens: 1800,
      messages: [
        {
          role: "system",
          content: `You are a supportive secondary math tutor for Algebra through Calculus, AP, and IB.
Your job is to check student work step-by-step.
Rules:
- Be encouraging and clear.
- Identify the first meaningful error and explain why it is incorrect.
- Guide the student toward the next correct step with questions and hints.
- Do NOT give away the final numerical or symbolic answer unless the work is already fully correct.
- If work is correct, affirm each major step briefly and suggest a stretch check.
- Use plain text with short headings and numbered steps.`,
        },
        {
          role: "user",
          content: `Subject context: ${input.subject ?? "general advanced math"}

Problem statement:
${problemText || "(extracted / inferred from student work)"}

Student work:
${studentWork || "(no work provided)"}

Please review the work as a supportive tutor.`,
        },
      ],
    });

    const feedback = extractText(completion);
    if (!feedback) {
      return { feedback: "", error: "The AI returned an empty response. Try again." };
    }
    return { feedback, source: "cerebras" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cerebras request failed.";
    return {
      feedback: fallbackTutorFeedback(problemText, studentWork),
      error: `Cerebras unavailable (${message}). Showing offline tutor guidance.`,
      source: "fallback",
    };
  }
}

export async function generateQuizAction(input: {
  subject: string;
  topic: string;
}): Promise<{
  quiz: Array<{ id: string; question: string; choices: string[]; answerIndex: number }>;
  error?: string;
  source?: "cerebras" | "fallback";
}> {
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.5,
      max_tokens: 1600,
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON for a short multiple-choice math quiz.",
        },
        {
          role: "user",
          content: `Create a 4-question multiple-choice quiz for ${input.subject} on "${input.topic}".
JSON shape:
{
  "quiz": [
    {
      "id": "1",
      "question": "...",
      "choices": ["A", "B", "C", "D"],
      "answerIndex": 0
    }
  ]
}`,
        },
      ],
    });
    const raw = extractText(completion);
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const parsed = JSON.parse((fenced?.[1] ?? raw).trim()) as {
      quiz: Array<{
        id: string;
        question: string;
        choices: string[];
        answerIndex: number;
      }>;
    };
    return { quiz: parsed.quiz ?? [], source: "cerebras" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quiz generation failed.";
    return {
      quiz: fallbackQuiz(input.subject, input.topic),
      error: `Cerebras unavailable (${message}). Showing offline demo quiz.`,
      source: "fallback",
    };
  }
}
