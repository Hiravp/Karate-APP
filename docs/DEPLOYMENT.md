# Deploy All-in-One Math Help to Vercel

**Optional — for later.** The app is fully usable locally without Vercel or Supabase.
Use this guide when you are ready to connect cloud auth/DB and host the site.

## 1. Create a Supabase project (optional)

Without Supabase keys the app still works using a browser `localStorage` demo store. For real auth and shared class data:

1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. Open **SQL Editor** → **New query**.
3. Paste the contents of [`supabase/schema.sql`](../supabase/schema.sql) and run it.
4. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (optional, server-only; never commit or expose client-side)

## 2. Create a Vercel project linked to this repo

1. Sign in at [https://vercel.com](https://vercel.com).
2. **Add New… → Project** and import this GitHub repository.
3. Framework Preset should detect **Next.js** automatically (see also root `vercel.json`).
4. Leave the build settings at defaults:
   - **Build Command:** `next build` (or `npm run build`)
   - **Output Directory:** managed by Next.js (do not override)
   - **Install Command:** `npm install`

You can also deploy from your machine without the dashboard:

```bash
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

(`npx` downloads the Vercel CLI on demand; no project dependency required.)

## 3. Set environment variables in Vercel

In the Vercel project: **Settings → Environment Variables**. Add:

| Variable | Required | Notes |
| --- | --- | --- |
| `CEREBRAS_API_KEY` | Yes (for AI) | Server-only. Get a key from [Cerebras Cloud](https://cloud.cerebras.ai/). |
| `CEREBRAS_MODEL` | No | Defaults to `gemma-4-31b` if unset. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | From Supabase → Project Settings → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon/public key. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only. Do not prefix with `NEXT_PUBLIC_`. |

Enable each variable for **Production** (and **Preview** if you want preview deploys to hit the same backends).

See [`.env.example`](../.env.example) for the canonical list and comments.

## 4. Deploy

1. Click **Deploy** in the Vercel dashboard (or push to the connected branch).
2. Wait for the build to finish. Open the production URL Vercel assigns.
3. Smoke-check:
   - Landing page loads
   - Teacher and Student portals open
   - AI actions work when `CEREBRAS_API_KEY` is set
   - Auth/classes persist when Supabase vars are set

After changing env vars, trigger a **Redeploy** so the new values are applied.

## Local production check

```bash
cp .env.example .env.local   # fill in real values
npm install
npm run build
npm start
```

## Troubleshooting

- **AI features fail:** Confirm `CEREBRAS_API_KEY` is set in Vercel for the environment you deployed (Production vs Preview).
- **Demo-only auth:** Missing or blank Supabase URL/anon key → the app uses the localStorage demo store by design.
- **Build succeeds but runtime errors:** Check **Deployments → [deployment] → Functions / Logs** in Vercel.
