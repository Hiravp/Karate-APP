# All-in-One Math Help

Full-stack educational web app for teachers and students covering Algebra through Calculus, AP Math, and IB Math. AI features use the Cerebras API via Next.js Server Actions.

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **UI:** shadcn-style components + Lucide React
- **Backend / DB:** Supabase schema (PostgreSQL + Auth) with a local demo store when keys are unset
- **AI:** `@cerebras/cerebras_cloud_sdk` (server-only)

## Quick start

```bash
cp .env.example .env.local
# Set CEREBRAS_API_KEY in .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Purpose |
| --- | --- |
| `CEREBRAS_API_KEY` | Server-side Cerebras key (required for AI Generate / Scanner / Games) |
| `CEREBRAS_MODEL` | Optional model override (default: `gemma-4-31b`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional service role key (server-only) |

Without Supabase credentials, auth and class data persist in the browser (`localStorage`) so you can demo the full flow.

## Deploy to Vercel

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for Supabase setup, linking this GitHub repo in Vercel, environment variables, and deploy steps. Preview/production from the CLI:

```bash
npx vercel
npx vercel --prod
```

## Supabase schema

Run `supabase/schema.sql` in the Supabase SQL editor to create:

- `users`, `classes`, `enrollments`, `assignments`, `submissions`
- signup trigger from `auth.users`
- row-level security policies for teachers and students

## Features

### Teacher portal (`/teacher`)

- Dashboard with managed classes and enrollments
- Auto-generated 6-character `class_code` on class creation
- Assignment builder with **AI Generate** (AP / IB / Standard worksheets)

### Student portal (`/student`)

- Join class by code
- Subject modules: Algebra, Geometry, Algebra 2, Precalculus, Calculus, AP, IB
- Math games (AI quizzes)
- AI Homework Scanner with mock OCR image upload + Cerebras tutor feedback

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
npm test         # unit tests
```
