"use client";

import { useMemo, useState } from "react";
import { CloudRain, DollarSign, Footprints, Sparkles, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  ReplanAction,
  ReplanReason,
  ReplanRequest,
} from "@/features/ai/schemas/replanning.schema";
import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

type ModifyPanelProps = {
  open: boolean;
  plan: TravelPlan;
  targetDayId: string;
  targetActivityId?: string;
  lockedActivityIds: string[];
  favoriteActivityIds: string[];
  onOpenChange: (open: boolean) => void;
  onGenerate: (request: ReplanRequest) => void;
};

const quickActions: Array<{ action: ReplanAction; label: string; icon: typeof Sparkles }> = [
  { action: "replace_activity", label: "Replace activity", icon: Sparkles },
  { action: "insert_activity", label: "Insert activity", icon: Footprints },
  { action: "change_budget", label: "Change budget", icon: DollarSign },
  { action: "rain_plan", label: "Rain plan", icon: CloudRain },
  { action: "more_food", label: "More food", icon: Utensils },
  { action: "accessibility", label: "Accessibility", icon: Footprints },
];

const reasons: Array<{ value: ReplanReason; label: string }> = [
  { value: "not_enough_time", label: "Time is tight" },
  { value: "not_interested", label: "Not interested" },
  { value: "too_expensive", label: "Too expensive" },
  { value: "too_far", label: "Too far" },
  { value: "weather", label: "Weather changed" },
  { value: "too_crowded", label: "Too crowded" },
  { value: "custom", label: "Custom" },
];

export function ModifyPanel({
  open,
  plan,
  targetDayId,
  targetActivityId,
  lockedActivityIds,
  favoriteActivityIds,
  onOpenChange,
  onGenerate,
}: ModifyPanelProps) {
  const [action, setAction] = useState<ReplanAction>("replace_activity");
  const [selectedReasons, setSelectedReasons] = useState<ReplanReason[]>(["not_interested"]);
  const [customInstruction, setCustomInstruction] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const targetDay = useMemo(
    () => plan.days.find((day) => day.id === targetDayId),
    [plan.days, targetDayId],
  );
  const targetActivity = targetDay?.activities.find((activity) => activity.id === targetActivityId);

  function toggleReason(reason: ReplanReason) {
    setSelectedReasons((current) =>
      current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason],
    );
  }

  function handleGenerate() {
    onGenerate({
      action,
      targetDayId,
      targetActivityId,
      reasons: selectedReasons.length > 0 ? selectedReasons : ["custom"],
      customInstruction: customInstruction || undefined,
      lockedActivityIds,
      favoriteActivityIds,
      constraints: {
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        weather: action === "rain_plan" ? "rain" : undefined,
        accessibility: action === "accessibility" ? "low-walking" : undefined,
        avoidCrowds: action === "avoid_crowds",
        keepFavorites: true,
      },
    });
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modify-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close modify panel"
        onClick={() => onOpenChange(false)}
      />
      <div className="bg-background absolute right-0 bottom-0 left-0 mx-auto max-h-[92vh] max-w-3xl overflow-y-auto rounded-t-xl border shadow-lg sm:right-4 sm:bottom-4 sm:left-auto sm:w-[720px] sm:rounded-xl">
        <div className="grid gap-1.5 p-4 text-center sm:text-left">
          <h2 id="modify-title" className="text-lg leading-none font-semibold tracking-tight">
            Modify with AI
          </h2>
          <p className="text-muted-foreground text-sm">
            Choose a structured change. AI will return a minimal JSON Patch for the selected day.
          </p>
        </div>

        <div className="space-y-5 px-4 pb-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Target</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {targetDay?.title ?? "Selected day"}
              {targetActivity ? ` · ${targetActivity.title}` : ""}
            </p>
          </div>

          <section aria-label="Modification type" className="space-y-3">
            <p className="text-sm font-medium">What should change?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {quickActions.map((item) => (
                <button
                  key={item.action}
                  type="button"
                  aria-pressed={action === item.action}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    action === item.action ? "border-primary bg-primary/10" : "hover:bg-muted/60"
                  }`}
                  onClick={() => setAction(item.action)}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section aria-label="Modification reason" className="space-y-3">
            <p className="text-sm font-medium">Why?</p>
            <div className="flex flex-wrap gap-2">
              {reasons.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  aria-pressed={selectedReasons.includes(reason.value)}
                  className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                    selectedReasons.includes(reason.value)
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted/60"
                  }`}
                  onClick={() => toggleReason(reason.value)}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </section>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Budget cap for this day</span>
            <input
              value={budgetMax}
              onChange={(event) => setBudgetMax(event.target.value)}
              inputMode="numeric"
              placeholder="Optional"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Custom requirement</span>
            <textarea
              value={customInstruction}
              onChange={(event) => setCustomInstruction(event.target.value)}
              placeholder="Example: keep this near Shibuya, reduce walking, avoid queues"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>

          <div className="bg-muted/40 rounded-lg border p-4 text-sm">
            <p className="font-medium">Protection rules</p>
            <p className="text-muted-foreground mt-1 leading-6">
              {lockedActivityIds.length} locked item(s) and {favoriteActivityIds.length} favorite
              item(s) will be preserved. Non-target days are out of scope.
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 p-4">
          <button
            type="button"
            data-testid="generate-minimal-patch"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            onClick={handleGenerate}
          >
            <Sparkles aria-hidden="true" />
            Generate minimal patch
          </button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
