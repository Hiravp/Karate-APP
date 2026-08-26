# All-in-One Math Help

Educational web app for teachers and students covering Algebra through Calculus, AP Math, and IB Math.

**Local-first:** auth, classes, enrollments, and assignments run in the browser (`localStorage`). Cerebras AI runs through Next.js server actions. Supabase and Vercel can be connected later — schema and deploy notes are already in the repo.

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **UI:** shadcn-style components + Lucide React
- **Local data:** browser demo store
- **AI:** `@cerebras/cerebras_cloud_sdk` (server-only, with offline fallbacks)

## Quick start

```bash
cp .env.example .env.local
# Optional: set CEREBRAS_API_KEY (offline demo worksheets/feedback still work without it)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local demo flow

1. Sign up as a **teacher** → create a class → copy the 6-character code  
2. Sign out → sign up as a **student** in the **same browser** → join with that code  
3. Teacher: Assignment builder → **AI Generate** → save  
4. Student: Assignments, Subjects, Games, or AI Homework Scanner  

## Environment

| Variable | Purpose |
| --- | --- |
| `CEREBRAS_API_KEY` | Live AI (optional; offline content used if unavailable) |
| `CEREBRAS_MODEL` | Optional override (default `gemma-4-31b`) |

## Later: Supabase + Vercel

When you are ready to connect cloud services:

- Run `supabase/schema.sql` in the Supabase SQL editor  
- Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel  

## Features

### Teacher portal (`/teacher`)

- Dashboard with managed classes and enrollments  
- Auto-generated 6-character `class_code`  
- Assignment builder with **AI Generate** (AP / IB / Standard)

### Student portal (`/student`)

- Join class by code  
- View and answer assignments  
- Subject modules: Algebra → IB Math  
- Math games (AI quizzes)  
- AI Homework Scanner (mock OCR + tutor feedback)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```
