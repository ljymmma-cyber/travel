"use client";

import { motion } from "framer-motion";

import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

import { BudgetCard } from "./budget-card";
import { MapPreview } from "./map-preview";
import { NotesCard } from "./notes-card";
import { TimelineHeader } from "./timeline-header";
import { TripOverview } from "./trip-overview";
import { TravelTimeline } from "./travel-timeline";

type TimelineShellProps = {
  plan: TravelPlan | null;
  state?: "ready" | "loading" | "streaming" | "empty" | "json-error" | "network-error";
};

export function TimelineShell({ plan, state = "ready" }: TimelineShellProps) {
  if (state === "loading" || state === "streaming") {
    return <TimelineSkeleton isStreaming={state === "streaming"} />;
  }

  if (state === "json-error" || state === "network-error") {
    return <TimelineErrorState type={state} />;
  }

  if (!plan || state === "empty") {
    return <TimelineEmptyState />;
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <TimelineHeader plan={plan} />
          <TripOverview plan={plan} />
          <TravelTimeline plan={plan} />
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-5 lg:sticky lg:top-6 lg:self-start"
        >
          <MapPreview plan={plan} />
          <BudgetCard plan={plan} />
          <NotesCard plan={plan} />
        </motion.aside>
      </div>
    </main>
  );
}

function TimelineEmptyState() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="border-border bg-card max-w-xl rounded-xl border p-8 text-center shadow-sm">
        <p className="text-muted-foreground text-sm font-medium">No trip yet</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Your timeline will appear here
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Generate a travel plan from the planner, then the AI output will be translated into an
          executable day-by-day route.
        </p>
      </div>
    </main>
  );
}

function TimelineErrorState({ type }: { type: "json-error" | "network-error" }) {
  const copy =
    type === "json-error"
      ? "The travel plan JSON could not be parsed. Keep the original input and regenerate the plan."
      : "The timeline could not be loaded. Your plan is preserved, so retrying will not lose work.";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="border-destructive/30 bg-card max-w-xl rounded-xl border p-8 text-center shadow-sm">
        <p className="text-destructive text-sm font-medium">
          {type === "json-error" ? "JSON error" : "Network error"}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Timeline unavailable</h1>
        <p className="text-muted-foreground mt-3 leading-7">{copy}</p>
      </div>
    </main>
  );
}

function TimelineSkeleton({ isStreaming }: { isStreaming: boolean }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <div className="bg-muted h-5 w-32 animate-pulse rounded" />
            <div className="bg-muted mt-5 h-10 w-3/4 animate-pulse rounded" />
            <div className="bg-muted mt-4 h-5 w-1/2 animate-pulse rounded" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-card rounded-xl border p-5 shadow-sm">
              <div className="bg-muted h-6 w-40 animate-pulse rounded" />
              <div className="mt-5 space-y-4">
                <div className="bg-muted h-28 animate-pulse rounded-lg" />
                <div className="bg-muted h-28 animate-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-5">
          <div className="bg-muted h-72 animate-pulse rounded-xl border" />
          <div className="bg-muted h-80 animate-pulse rounded-xl border" />
        </div>
      </div>
      {isStreaming ? (
        <div className="bg-background fixed right-5 bottom-5 rounded-full border px-4 py-2 text-sm shadow-sm">
          AI is streaming timeline blocks...
        </div>
      ) : null}
    </main>
  );
}
