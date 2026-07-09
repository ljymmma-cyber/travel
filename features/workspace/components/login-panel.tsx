import { Code2, Mail, Search } from "lucide-react";

import { signInWithEmail, signInWithOAuth } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginPanel({ error, sent }: { error?: string; sent?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="bg-card w-full max-w-md rounded-xl border p-6 shadow-sm">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">AI Travel Planner</p>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to save your trips</h1>
          <p className="text-muted-foreground text-sm leading-6">
            Sync itineraries, version history, favorites, and partial replanning edits across
            devices.
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          <form action={signInWithOAuth.bind(null, "google")}>
            <Button className="w-full" variant="outline" type="submit">
              <Search aria-hidden="true" />
              Continue with Google
            </Button>
          </form>
          <form action={signInWithOAuth.bind(null, "github")}>
            <Button className="w-full" variant="outline" type="submit">
              <Code2 aria-hidden="true" />
              Continue with GitHub
            </Button>
          </form>
        </div>

        <form action={signInWithEmail} className="mt-6 space-y-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email magic link</span>
            <Input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <Button className="w-full" type="submit">
            <Mail aria-hidden="true" />
            Send magic link
          </Button>
        </form>

        {sent ? (
          <p className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Magic link sent. Check your email to continue.
          </p>
        ) : null}
        {error ? (
          <p className="border-destructive/30 text-destructive mt-4 rounded-lg border px-3 py-2 text-sm">
            {error}
          </p>
        ) : null}

        <p className="text-muted-foreground mt-5 text-xs leading-5">
          Anonymous visitors can explore mock trips locally. Sign in when you want cross-device sync
          and durable storage.
        </p>
      </section>
    </main>
  );
}
