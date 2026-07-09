"use client";

import { useState } from "react";
import {
  Bookmark,
  Clock,
  GripVertical,
  Heart,
  Info,
  Map,
  RefreshCw,
  Trash2,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/features/ai/schemas/travel-plan.schema";

import { formatDuration, formatMoney, getActivityImage } from "../lib/timeline-utils";
import { ExplainCard } from "./explain-card";

type ActivityCardProps = {
  activity: Activity;
  index: number;
  isLast: boolean;
};

export function ActivityCard({ activity, index, isLast }: ActivityCardProps) {
  const [showExplain, setShowExplain] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const image = getActivityImage(activity);

  return (
    <motion.article
      layout
      whileHover={{ y: -2 }}
      className="group relative grid gap-3 pl-12 sm:pl-16"
    >
      <div className="bg-primary text-primary-foreground absolute top-5 left-0 z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold sm:h-11 sm:w-11">
        {index + 1}
      </div>
      {!isLast ? (
        <div className="bg-border absolute top-16 left-[1.1rem] h-6 w-px sm:left-[1.35rem]" />
      ) : null}

      <div className="bg-card hover:border-primary/25 rounded-xl border p-3 shadow-sm transition-colors sm:p-4">
        <div className="grid gap-4 md:grid-cols-[156px_minmax(0,1fr)]">
          <div
            className={`from-muted to-muted/60 flex aspect-[4/3] items-center justify-center rounded-lg bg-gradient-to-br ${image.imageGradient}`}
            role="img"
            aria-label={`${activity.title} placeholder image`}
          >
            <span className="bg-background/75 rounded-full px-3 py-1 text-xs font-medium capitalize backdrop-blur">
              {image.imageLabel}
            </span>
          </div>

          <div className="min-w-0 space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {activity.timeSlot}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {activity.type.replace("-", " ")}
                  </Badge>
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {activity.startTime ?? "Flexible"} · {formatDuration(activity.durationMinutes)}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold tracking-tight">{activity.title}</h4>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {activity.location.area ? `${activity.location.area} · ` : ""}
                    {activity.location.address ?? activity.location.name}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Reserved drag handle">
                  <GripVertical aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Open map preview">
                  <Map aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={bookmarked ? "Remove bookmark" : "Bookmark activity"}
                  onClick={() => setBookmarked((value) => !value)}
                >
                  {bookmarked ? <Heart aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
                </Button>
                <Button variant="ghost" size="icon" aria-label="Replan this activity">
                  <RefreshCw aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete activity">
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>

            <p className="text-sm leading-6">{activity.userValue}</p>

            <div className="grid gap-2 sm:grid-cols-3">
              <Fact
                icon={Wallet}
                label="Budget"
                value={`${formatMoney(activity.budget.min, activity.budget.currency)}-${formatMoney(activity.budget.max, activity.budget.currency)}`}
              />
              <Fact
                icon={RefreshCw}
                label="Next transport"
                value={
                  activity.transportToNext
                    ? `${activity.transportToNext.mode.replace("-", " ")} · ${activity.transportToNext.estimatedDurationMinutes ?? "?"}m`
                    : "End of day"
                }
              />
              <Fact
                icon={Info}
                label="AI confidence"
                value={`${Math.round(activity.confidence * 100)}%`}
              />
            </div>

            <button
              type="button"
              className="text-primary text-sm font-medium underline-offset-4 hover:underline"
              aria-expanded={showExplain}
              onClick={() => setShowExplain((value) => !value)}
            >
              Why recommended?
            </button>

            {showExplain ? <ExplainCard activity={activity} /> : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <span className="bg-muted/40 flex min-h-14 items-center gap-2 rounded-lg border px-3 py-2">
      <Icon className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        <span className="text-muted-foreground block text-xs">{label}</span>
        <span className="block truncate text-sm font-medium capitalize">{value}</span>
      </span>
    </span>
  );
}
