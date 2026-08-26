# Supabase setup (for later)

The app runs locally with a browser demo store today. When you connect Supabase:

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`schema.sql`](./schema.sql).
3. Enable Email auth under **Authentication → Providers**.
4. Copy the project URL and anon key into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Tables created: `users`, `classes`, `enrollments`, `assignments`, `submissions` (with RLS).

See also [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).
