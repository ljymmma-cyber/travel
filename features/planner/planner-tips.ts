import type { PlannerInput } from "@/schemas/planner.schema";

export type PlannerTip = {
  id: string;
  tone: "info" | "warning" | "success";
  title: string;
  description: string;
};

export function getPlannerTips(values: PlannerInput): PlannerTip[] {
  const tips: PlannerTip[] = [];

  if (!values.destination) {
    tips.push({
      id: "empty-destination",
      tone: "info",
      title: "Start with a city",
      description: "A specific city helps the AI plan realistic neighborhoods and daily routes.",
    });
  }

  if (values.days <= 2 && values.interests.length >= 5) {
    tips.push({
      id: "short-trip-many-interests",
      tone: "warning",
      title: "Too many themes for a short trip",
      description: "Pick the top 2-3 interests so the plan does not become rushed.",
    });
  }

  if (values.pace === "packed" && values.accessibility !== "none") {
    tips.push({
      id: "pace-accessibility-conflict",
      tone: "warning",
      title: "Pace may conflict with accessibility",
      description: "A balanced pace may produce a more comfortable itinerary.",
    });
  }

  if (
    values.budget > 0 &&
    values.days > 0 &&
    values.budget / values.days < 80 &&
    values.currency !== "JPY"
  ) {
    tips.push({
      id: "low-daily-budget",
      tone: "warning",
      title: "Budget may be tight",
      description: "The AI can still plan, but it may need more free activities and simpler meals.",
    });
  }

  if (values.hasFlights && values.hasHotel) {
    tips.push({
      id: "strong-constraints",
      tone: "success",
      title: "Great constraints",
      description: "Flights and hotel details make the next AI plan easier to ground in Sprint 2.",
    });
  }

  return tips.slice(0, 4);
}
