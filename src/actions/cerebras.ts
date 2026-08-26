"use server";

import Cerebras from "@cerebras/cerebras_cloud_sdk";
import type { AssignmentQuestion } from "@/lib/types";

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

export async function generateWorksheetAction(input: {
  topic: string;
  subject?: string;
  format?: "AP" | "IB" | "Standard";
  questionCount?: number;
}): Promise<{ questions: AssignmentQuestion[]; raw: string; error?: string }> {
  const topic = input.topic.trim();
  if (!topic) return { questions: [], raw: "", error: "Topic is required." };

  const count = Math.min(Math.max(input.questionCount ?? 5, 3), 8);
  const format = input.format ?? "AP";
  const subject = input.subject ?? "advanced high school mathematics";

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b",
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
    return { questions: parseQuestions(raw), raw };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cerebras request failed.";
    return { questions: [], raw: "", error: message };
  }
}

export async function scanHomeworkAction(input: {
  problemText: string;
  studentWork: string;
  subject?: string;
}): Promise<{ feedback: string; error?: string }> {
  const problemText = input.problemText.trim();
  const studentWork = input.studentWork.trim();
  if (!problemText && !studentWork) {
    return { feedback: "", error: "Provide a problem and/or student work to scan." };
  }

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b",
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
    return { feedback };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cerebras request failed.";
    return { feedback: "", error: message };
  }
}

export async function generateQuizAction(input: {
  subject: string;
  topic: string;
}): Promise<{
  quiz: Array<{ id: string; question: string; choices: string[]; answerIndex: number }>;
  error?: string;
}> {
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b",
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
    return { quiz: parsed.quiz ?? [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quiz generation failed.";
    return { quiz: [], error: message };
  }
}
