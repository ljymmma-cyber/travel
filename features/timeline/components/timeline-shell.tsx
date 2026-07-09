"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { applyTravelPlanPatch } from "@/features/ai/replanning/json-patch";
import { validateReplanPatchScope } from "@/features/ai/replanning/patch-validator";
import { diffTravelPlans, type TravelPlanDiff } from "@/features/ai/diff/travel-plan-diff";
import {
  createReplanHistory,
  pushReplanHistory,
  redoReplan,
  undoReplan,
  type ReplanHistoryState,
} from "@/features/ai/history/replan-history";
import type { ReplanRequest } from "@/features/ai/schemas/replanning.schema";
import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

import { BudgetCard } from "./budget-card";
import { MapPreview } from "./map-preview";
import { ModifyPanel } from "./modify-panel";
import { NotesCard } from "./notes-card";
import { TimelineHeader } from "./timeline-header";
import { TripOverview } from "./trip-overview";
import { TravelTimeline } from "./travel-timeline";
import { createMockReplanPatch } from "../lib/mock-replanning";
import type { ModifyPanelState } from "../types/replanning-ui.types";

type TimelineShellProps = {
  plan: TravelPlan | null;
  state?: "ready" | "loading" | "streaming" | "empty" | "json-error" | "network-error";
};

export function TimelineShell({ plan, state = "ready" }: TimelineShellProps) {
  const [history, setHistory] = useState<ReplanHistoryState | null>(() =>
    plan ? createReplanHistory(plan) : null,
  );
  const [favoriteActivityIds, setFavoriteActivityIds] = useState<string[]>([]);
  const [lockedActivityIds, setLockedActivityIds] = useState<string[]>([]);
  const [latestDiff, setLatestDiff] = useState<TravelPlanDiff | null>(null);
  const [replanError, setReplanError] = useState<string | null>(null);
  const [modifyPanel, setModifyPanel] = useState<ModifyPanelState>({
    open: false,
    targetDayId: plan?.days[0]?.id ?? "",
  });
  const activePlan = history?.present ?? plan;
  const activityStatuses = useMemo(() => {
    const map = new Map<string, string>();
    latestDiff?.activities.forEach((activity) => map.set(activity.activityId, activity.status));
    return map;
  }, [latestDiff]);

  if (state === "loading" || state === "streaming") {
    return <TimelineSkeleton isStreaming={state === "streaming"} />;
  }

  if (state === "json-error" || state === "network-error") {
    return <TimelineErrorState type={state} />;
  }

  if (!activePlan || state === "empty") {
    return <TimelineEmptyState />;
  }

  function openModifyPanel(targetDayId: string, targetActivityId?: string) {
    setModifyPanel({ open: true, targetDayId, targetActivityId });
  }

  function handleGeneratePatch(request: ReplanRequest) {
    if (!history) {
      return;
    }

    try {
      setReplanError(null);
      const patchResponse = createMockReplanPatch(history.present, request);
      const scopeIssues = validateReplanPatchScope(history.present, request, patchResponse.patches);

      if (scopeIssues.length > 0) {
        setLatestDiff(null);
        setReplanError(scopeIssues[0]?.message ?? "Patch was rejected by scope validation.");
        setModifyPanel((current) => ({ ...current, open: false }));
        return;
      }

      const applyResult = applyTravelPlanPatch(history.present, patchResponse.patches);

      if (!applyResult.ok) {
        setReplanError(applyResult.error);
        setModifyPanel((current) => ({ ...current, open: false }));
        return;
      }

      const diff = diffTravelPlans(history.present, applyResult.plan);
      setLatestDiff(diff);
      setHistory(
        pushReplanHistory(history, {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          request,
          before: history.present,
          after: applyResult.plan,
          patchResponse,
          diff,
        }),
      );
      setModifyPanel((current) => ({ ...current, open: false }));
    } catch (error) {
      setLatestDiff(null);
      setReplanError(error instanceof Error ? error.message : "Partial replanning failed.");
      setModifyPanel((current) => ({ ...current, open: false }));
    }
  }

  function handleUndo() {
    if (!history) {
      return;
    }

    const next = undoReplan(history);
    setHistory(next);
    setLatestDiff(next.past.at(-1)?.diff ?? null);
  }

  function handleRedo() {
    if (!history) {
      return;
    }

    const next = redoReplan(history);
    setHistory(next);
    setLatestDiff(next.past.at(-1)?.diff ?? null);
  }

  function toggleFavorite(activityId: string) {
    setFavoriteActivityIds((current) =>
      current.includes(activityId)
        ? current.filter((id) => id !== activityId)
        : [...current, activityId],
    );
  }

  function toggleLock(activityId: string) {
    setLockedActivityIds((current) =>
      current.includes(activityId)
        ? current.filter((id) => id !== activityId)
        : [...current, activityId],
    );
  }

  function handleDeleteActivity(targetDayId: string, targetActivityId: string) {
    handleGeneratePatch({
      action: "delete_activity",
      targetDayId,
      targetActivityId,
      reasons: ["not_interested"],
      lockedActivityIds,
      favoriteActivityIds,
      constraints: {
        keepFavorites: true,
        avoidCrowds: false,
      },
    });
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <TimelineHeader
            plan={activePlan}
            canUndo={Boolean(history?.past.length)}
            canRedo={Boolean(history?.future.length)}
            onModify={() => openModifyPanel(activePlan.days[0]?.id ?? "")}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
          {replanError ? <ReplanError message={replanError} /> : null}
          {latestDiff ? <DiffSummary diff={latestDiff} /> : null}
          <TripOverview plan={activePlan} />
          <TravelTimeline
            plan={activePlan}
            activityStatuses={activityStatuses}
            favoriteActivityIds={favoriteActivityIds}
            lockedActivityIds={lockedActivityIds}
            onModifyActivity={openModifyPanel}
            onDeleteActivity={handleDeleteActivity}
            onToggleFavorite={toggleFavorite}
            onToggleLock={toggleLock}
          />
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-5 lg:sticky lg:top-6 lg:self-start"
        >
          <MapPreview plan={activePlan} />
          <BudgetCard plan={activePlan} />
          <NotesCard plan={activePlan} />
        </motion.aside>
      </div>
      <ModifyPanel
        open={modifyPanel.open}
        plan={activePlan}
        targetDayId={modifyPanel.targetDayId}
        targetActivityId={modifyPanel.targetActivityId}
        lockedActivityIds={lockedActivityIds}
        favoriteActivityIds={favoriteActivityIds}
        onOpenChange={(open) => setModifyPanel((current) => ({ ...current, open }))}
        onGenerate={handleGeneratePatch}
      />
    </main>
  );
}

function ReplanError({ message }: { message: string }) {
  return (
    <section className="border-destructive/30 bg-card rounded-xl border p-4 shadow-sm">
      <p className="text-destructive text-sm font-medium">Patch rejected</p>
      <p className="text-muted-foreground mt-1 text-sm">{message}</p>
    </section>
  );
}

function DiffSummary({ diff }: { diff: TravelPlanDiff }) {
  const added = diff.activities.filter((activity) => activity.status === "added").length;
  const modified = diff.activities.filter((activity) => activity.status === "modified").length;
  const removed = diff.activities.filter((activity) => activity.status === "removed").length;

  return (
    <section className="bg-card rounded-xl border p-4 shadow-sm" aria-label="AI change summary">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">AI changed only the selected scope</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {diff.preservedDayIds.length} day(s) preserved. Review highlighted timeline blocks
            below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-700">
            {added} added
          </span>
          <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700">
            {modified} modified
          </span>
          <span className="bg-muted text-muted-foreground rounded-full border px-3 py-1">
            {removed} removed
          </span>
        </div>
      </div>
    </section>
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
