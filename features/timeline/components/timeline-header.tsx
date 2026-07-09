import {
  CalendarDays,
  Download,
  PencilLine,
  RotateCcw,
  RotateCw,
  Share2,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

import { formatMoney } from "../lib/timeline-utils";

export function TimelineHeader({
  plan,
  canUndo = false,
  canRedo = false,
  onModify,
  onUndo,
  onRedo,
}: {
  plan: TravelPlan;
  canUndo?: boolean;
  canRedo?: boolean;
  onModify?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}) {
  return (
    <header className="bg-card rounded-xl border p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <Badge variant="secondary" className="w-fit">
            <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            AI-generated timeline
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              {plan.title}
            </h1>
            <p className="text-muted-foreground text-base leading-7">{plan.summary}</p>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {plan.durationDays} days in {plan.destination}
            </span>
            <span>{formatMoney(plan.totalBudget.min, plan.totalBudget.currency)} min plan</span>
            <span>{Math.round(plan.confidence * 100)}% confidence</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button variant="outline" size="sm">
            <Share2 aria-hidden="true" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download aria-hidden="true" />
            Export
          </Button>
          <Button variant="outline" size="sm" disabled={!canUndo} onClick={onUndo}>
            <RotateCcw aria-hidden="true" />
            Undo
          </Button>
          <Button variant="outline" size="sm" disabled={!canRedo} onClick={onRedo}>
            <RotateCw aria-hidden="true" />
            Redo
          </Button>
          <Button size="sm" onClick={onModify}>
            <PencilLine aria-hidden="true" />
            Modify
          </Button>
        </div>
      </div>
    </header>
  );
}
