import type { Activity, DayPlan, TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

import type { BudgetBreakdown, DayTimelineMetrics, WeatherSummary } from "../types/timeline.types";

const weatherByDay: WeatherSummary[] = [
  { condition: "sunny", temperatureC: 24, precipitationChance: 10 },
  { condition: "cloudy", temperatureC: 22, precipitationChance: 25 },
  { condition: "rain", temperatureC: 20, precipitationChance: 60 },
  { condition: "sunny", temperatureC: 25, precipitationChance: 8 },
];

export function getMockWeather(dayIndex: number): WeatherSummary {
  return weatherByDay[(dayIndex - 1) % weatherByDay.length] ?? weatherByDay[0];
}

export function getDayMetrics(day: DayPlan): DayTimelineMetrics {
  const transportCount = day.activities.filter((activity) => activity.transportToNext).length;
  const totalDurationMinutes = day.activities.reduce(
    (sum, activity) =>
      sum + activity.durationMinutes + (activity.transportToNext?.estimatedDurationMinutes ?? 0),
    0,
  );
  const walkingDistanceKm = Number(
    day.activities
      .reduce((sum, activity) => {
        if (activity.transportToNext?.mode === "walk") {
          return sum + estimateWalkingDistance(activity.transportToNext.estimatedDurationMinutes);
        }

        return sum + estimateActivityWalking(activity);
      }, 0)
      .toFixed(1),
  );

  return {
    totalDurationMinutes,
    transportCount,
    estimatedSteps: Math.round(walkingDistanceKm * 1350),
    walkingDistanceKm,
  };
}

export function getBudgetBreakdown(plan: TravelPlan): BudgetBreakdown {
  const dayTotals = plan.days.reduce(
    (sum, day) => ({
      food: sum.food + day.dailyBudget.food,
      transport: sum.transport + day.dailyBudget.transport,
      tickets: sum.tickets + day.dailyBudget.tickets,
      shopping: sum.shopping + day.dailyBudget.shoppingBuffer,
      plannedMin: sum.plannedMin + day.dailyBudget.min,
      plannedMax: sum.plannedMax + day.dailyBudget.max,
    }),
    { food: 0, transport: 0, tickets: 0, shopping: 0, plannedMin: 0, plannedMax: 0 },
  );

  const activityHotelBudget = plan.days
    .flatMap((day) => day.activities)
    .reduce((sum, activity) => {
      if (activity.budget.category === "hotel") {
        return sum + activity.budget.max;
      }

      return sum;
    }, 0);

  return {
    currency: plan.totalBudget.currency,
    food: dayTotals.food,
    transport: dayTotals.transport,
    tickets: dayTotals.tickets,
    hotel: activityHotelBudget,
    shopping: dayTotals.shopping,
    other: Math.max(0, plan.totalBudget.max - dayTotals.plannedMax - activityHotelBudget),
    plannedMin: dayTotals.plannedMin,
    plannedMax: dayTotals.plannedMax,
    tripBudgetMax: plan.totalBudget.max,
    remaining: Math.max(0, plan.totalBudget.max - dayTotals.plannedMax),
  };
}

export function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function getActivityImage(activity: Activity) {
  const gradients: Record<Activity["type"], string> = {
    attraction: "from-sky-200 via-cyan-100 to-emerald-100",
    restaurant: "from-rose-200 via-orange-100 to-amber-100",
    cafe: "from-lime-100 via-stone-100 to-amber-100",
    shopping: "from-fuchsia-100 via-rose-100 to-orange-100",
    museum: "from-indigo-100 via-slate-100 to-cyan-100",
    nature: "from-emerald-200 via-lime-100 to-sky-100",
    transport: "from-slate-200 via-zinc-100 to-stone-100",
    rest: "from-teal-100 via-cyan-100 to-sky-100",
    hotel: "from-violet-100 via-slate-100 to-sky-100",
    "free-time": "from-yellow-100 via-lime-100 to-emerald-100",
  };

  return {
    imageLabel: activity.type.replace("-", " "),
    imageGradient: gradients[activity.type],
  };
}

function estimateWalkingDistance(minutes: number | null) {
  if (!minutes) {
    return 0.2;
  }

  return Math.max(0.2, minutes * 0.075);
}

function estimateActivityWalking(activity: Activity) {
  if (activity.type === "museum" || activity.type === "shopping" || activity.type === "nature") {
    return 1.1;
  }

  if (activity.type === "attraction") {
    return 0.8;
  }

  return 0.35;
}
