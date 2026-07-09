"use client";

import { motion } from "framer-motion";

import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

import { getDayMetrics, getMockWeather } from "../lib/timeline-utils";
import { DayCard } from "./day-card";

export function TravelTimeline({ plan }: { plan: TravelPlan }) {
  return (
    <section aria-label="Trip timeline" className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Timeline</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Editable itinerary blocks generated from structured AI JSON.
          </p>
        </div>
        <p className="text-muted-foreground hidden text-sm sm:block">
          Drag sorting reserved for V2
        </p>
      </div>

      <motion.div initial="hidden" animate="show" className="space-y-5">
        {plan.days.map((day) => (
          <motion.div
            key={day.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <DayCard
              day={day}
              metrics={getDayMetrics(day)}
              weather={getMockWeather(day.dayIndex)}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
