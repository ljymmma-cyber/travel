"use client";

import { useState } from "react";
import {
  ChevronDown,
  CloudSun,
  Footprints,
  Gauge,
  Route,
  Timer,
  Train,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DayPlan } from "@/features/ai/schemas/travel-plan.schema";

import { formatDuration, formatMoney } from "../lib/timeline-utils";
import type { DayTimelineMetrics, WeatherSummary } from "../types/timeline.types";
import { ActivityCard } from "./activity-card";

type DayCardProps = {
  day: DayPlan;
  metrics: DayTimelineMetrics;
  weather: WeatherSummary;
};

export function DayCard({ day, metrics, weather }: DayCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b p-0">
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} Day ${day.dayIndex}: ${day.title}`}
          className="hover:bg-muted/50 flex w-full flex-col gap-4 p-5 text-left transition-colors sm:p-6"
          onClick={() => setExpanded((value) => !value)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Day {day.dayIndex}</Badge>
                <Badge variant="outline">{day.theme}</Badge>
                <Badge variant="secondary" className="capitalize">
                  {day.routeRisk} route risk
                </Badge>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{day.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-6">{day.summary}</p>
              </div>
            </div>
            <ChevronDown
              className={`mt-1 h-5 w-5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Metric
              icon={CloudSun}
              label="Weather"
              value={`${weather.temperatureC}°C ${weather.condition}`}
            />
            <Metric
              icon={Wallet}
              label="Budget"
              value={`${formatMoney(day.dailyBudget.min, day.dailyBudget.currency)}-${formatMoney(day.dailyBudget.max, day.dailyBudget.currency)}`}
            />
            <Metric
              icon={Footprints}
              label="Steps"
              value={metrics.estimatedSteps.toLocaleString()}
            />
            <Metric icon={Route} label="Walk" value={`${metrics.walkingDistanceKm} km`} />
            <Metric icon={Train} label="Transit" value={`${metrics.transportCount} times`} />
            <Metric
              icon={Timer}
              label="Total time"
              value={formatDuration(metrics.totalDurationMinutes)}
            />
          </div>
        </button>
      </CardHeader>

      {expanded ? (
        <CardContent className="p-4 sm:p-6">
          <div className="before:bg-border relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[1.1rem] before:w-px sm:before:left-[1.35rem]">
            {day.activities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
                isLast={index === day.activities.length - 1}
              />
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <span className="bg-background flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2">
      <Icon className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        <span className="text-muted-foreground block text-xs">{label}</span>
        <span className="block truncate text-sm font-medium">{value}</span>
      </span>
    </span>
  );
}
