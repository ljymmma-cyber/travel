"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, GitCompare, RotateCcw, Save } from "lucide-react";

import { autosaveTripAction } from "@/actions/workspace.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimelineShell } from "@/features/timeline/components/timeline-shell";

import type { TripVersion, WorkspaceTrip } from "../schemas/workspace.schema";
import { createVersionFromTrip, restoreVersion } from "../lib/workspace-utils";

const tripStoragePrefix = "ai-travel-planner:trip:";

export function TripDetailClient({
  initialTrip,
  initialVersions,
}: {
  initialTrip: WorkspaceTrip;
  initialVersions: TripVersion[];
}) {
  const [trip, setTrip] = useState(initialTrip);
  const [versions, setVersions] = useState(initialVersions);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed" | "local">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();
  const latestVersion = versions.toSorted((a, b) => b.versionNumber - a.versionNumber)[0];
  const storageKey = `${tripStoragePrefix}${initialTrip.id}`;

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      setTrip(JSON.parse(stored) as WorkspaceTrip);
    }
  }, [storageKey]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSaveState("saving");
      const nextTrip = { ...trip, updatedAt: new Date().toISOString() };
      window.localStorage.setItem(storageKey, JSON.stringify(nextTrip));

      startTransition(async () => {
        const result = await autosaveTripAction(nextTrip);
        setSaveState(result.ok ? "saved" : result.mode === "local" ? "local" : "failed");
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [storageKey, trip]);

  const compareSummary = useMemo(() => {
    if (!latestVersion) {
      return "No previous version to compare.";
    }

    const changedTitle = latestVersion.plan.title !== trip.plan.title;
    const changedBudget = latestVersion.plan.totalBudget.max !== trip.plan.totalBudget.max;

    if (!changedTitle && !changedBudget) {
      return "Current plan matches the latest saved version.";
    }

    return [changedTitle ? "title changed" : null, changedBudget ? "budget changed" : null]
      .filter(Boolean)
      .join(", ");
  }, [latestVersion, trip.plan.title, trip.plan.totalBudget.max]);

  function saveVersion() {
    const nextVersion = createVersionFromTrip(
      trip,
      versions.length + 1,
      "Manual save from workspace.",
      "manual_edit",
    );
    setVersions((current) => [nextVersion, ...current]);
    setTrip((current) => ({
      ...current,
      versionCount: current.versionCount + 1,
      updatedAt: new Date().toISOString(),
    }));
  }

  function restore(version: TripVersion) {
    setTrip((current) => restoreVersion(current, version));
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/workspace">
                <ArrowLeft aria-hidden="true" />
                My Trips
              </Link>
            </Button>
            <div>
              <p className="text-sm font-medium">{trip.destination}</p>
              <p className="text-muted-foreground text-xs">{compareSummary}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={saveState === "failed" ? "destructive" : "secondary"}>
              {saveState === "saving" || isPending
                ? "Saving..."
                : saveState === "saved"
                  ? "Saved"
                  : saveState === "local"
                    ? "Saved locally"
                    : saveState === "failed"
                      ? "Save failed"
                      : "Autosave ready"}
            </Badge>
            <Button size="sm" variant="outline" onClick={saveVersion}>
              <Save aria-hidden="true" />
              Save version
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <TimelineShell plan={trip.plan} />
        </div>
        <VersionHistoryPanel versions={versions} onRestore={restore} />
      </div>
    </main>
  );
}

function VersionHistoryPanel({
  versions,
  onRestore,
}: {
  versions: TripVersion[];
  onRestore: (version: TripVersion) => void;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <section className="bg-card rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <h2 className="font-semibold">Version history</h2>
        </div>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Restore a previous version when an AI edit does not feel right.
        </p>
      </section>

      <div className="space-y-3">
        {versions.map((version) => (
          <article key={version.id} className="bg-card rounded-xl border p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{version.label}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(version.createdAt).toLocaleString()} ·{" "}
                  {version.createdBy.replace("_", " ")}
                </p>
              </div>
              <Badge variant="outline">v{version.versionNumber}</Badge>
            </div>
            <p className="text-muted-foreground mt-3 text-sm leading-6">{version.summary}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" size="sm" variant="outline">
                <GitCompare aria-hidden="true" />
                Compare
              </Button>
              <Button type="button" size="sm" onClick={() => onRestore(version)}>
                <RotateCcw aria-hidden="true" />
                Restore
              </Button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
