import type { Activity, DayPlan, TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

export type WeatherSummary = {
  condition: "sunny" | "cloudy" | "rain" | "storm";
  temperatureC: number;
  precipitationChance: number;
};

export type DayTimelineMetrics = {
  totalDurationMinutes: number;
  transportCount: number;
  estimatedSteps: number;
  walkingDistanceKm: number;
};

export type BudgetBreakdown = {
  currency: TravelPlan["totalBudget"]["currency"];
  food: number;
  transport: number;
  tickets: number;
  hotel: number;
  shopping: number;
  other: number;
  plannedMin: number;
  plannedMax: number;
  tripBudgetMax: number;
  remaining: number;
};

export type ActivityAction = "map" | "bookmark" | "delete" | "replan";

export type TimelineDayViewModel = {
  day: DayPlan;
  weather: WeatherSummary;
  metrics: DayTimelineMetrics;
};

export type TimelineActivityViewModel = {
  activity: Activity;
  imageLabel: string;
  imageGradient: string;
};
