import type { Activity, Transport, TravelPlan } from "@/features/ai/schemas/travel-plan.schema";
import { defaultPlannerInput, type PlannerInput } from "@/schemas/planner.schema";

type DemoPlanInput = Pick<
  PlannerInput,
  "destination" | "days" | "budget" | "currency" | "interests" | "pace" | "transportation"
>;

const currencyValues = ["USD", "HKD", "CNY", "JPY", "EUR", "GBP"] as const;

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clampNumber(
  value: string | string[] | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(asString(value));

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseInterests(value: string | string[] | undefined) {
  const raw = asString(value);

  if (!raw) {
    return defaultPlannerInput.interests;
  }

  return raw
    .split(",")
    .map((interest) => interest.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function parseDemoPlanInput(
  searchParams: Record<string, string | string[] | undefined>,
): DemoPlanInput {
  const destination =
    asString(searchParams.destination)?.trim() || defaultPlannerInput.destination || "Tokyo";
  const currency = asString(searchParams.currency);

  return {
    destination,
    days: clampNumber(searchParams.days, defaultPlannerInput.days, 1, 30),
    budget: clampNumber(searchParams.budget, defaultPlannerInput.budget, 1, 1_000_000),
    currency: currencyValues.includes(currency as (typeof currencyValues)[number])
      ? (currency as DemoPlanInput["currency"])
      : defaultPlannerInput.currency,
    interests: parseInterests(searchParams.interests),
    pace:
      asString(searchParams.pace) === "relaxed" || asString(searchParams.pace) === "packed"
        ? (asString(searchParams.pace) as DemoPlanInput["pace"])
        : defaultPlannerInput.pace,
    transportation:
      asString(searchParams.transportation) === "walking" ||
      asString(searchParams.transportation) === "taxi" ||
      asString(searchParams.transportation) === "rental-car" ||
      asString(searchParams.transportation) === "mixed"
        ? (asString(searchParams.transportation) as DemoPlanInput["transportation"])
        : defaultPlannerInput.transportation,
  };
}

const dayThemes = [
  {
    title: "Arrival, Old Town and Local Food",
    theme: "Low-friction first day",
    activities: [
      "Historic center orientation",
      "Local market lunch",
      "Riverside or main street walk",
    ],
  },
  {
    title: "Culture, Neighborhoods and Signature Views",
    theme: "First-time highlights with breathing room",
    activities: ["Landmark morning route", "Neighborhood cafe lunch", "Scenic viewpoint window"],
  },
  {
    title: "Museums, Shopping and Food Streets",
    theme: "Indoor-friendly discovery day",
    activities: ["Museum or gallery block", "Shopping district browse", "Food street dinner"],
  },
  {
    title: "Local Life and Flexible Finish",
    theme: "Slower final-day exploration",
    activities: [
      "Local park or residential walk",
      "Casual lunch cluster",
      "Flexible farewell dinner",
    ],
  },
  {
    title: "Day Trip or Hidden Neighborhood",
    theme: "Optional deeper exploration",
    activities: ["Nearby district morning", "Specialty lunch stop", "Golden-hour photo walk"],
  },
];

function getDayTheme(dayIndex: number) {
  return dayThemes[(dayIndex - 1) % dayThemes.length];
}

function getActivityType(index: number, interests: string[]): Activity["type"] {
  if (index === 1) {
    return interests.includes("museums") ? "museum" : "attraction";
  }

  if (index === 2) {
    return interests.includes("coffee") ? "cafe" : "restaurant";
  }

  if (interests.includes("shopping")) {
    return "shopping";
  }

  if (interests.includes("nature")) {
    return "nature";
  }

  return "attraction";
}

export function createDemoTravelPlan(
  searchParams: Record<string, string | string[] | undefined>,
): TravelPlan {
  const input = parseDemoPlanInput(searchParams);
  const dailyBudget = Math.max(Math.round(input.budget / input.days), 1);
  const transportMode: Transport["mode"] =
    input.transportation === "walking" ? "walk" : input.transportation;
  const paceLabel =
    input.pace === "packed" ? "efficient" : input.pace === "relaxed" ? "relaxed" : "balanced";

  const days = Array.from({ length: input.days }, (_, dayOffset) => {
    const dayIndex = dayOffset + 1;
    const dayTheme = getDayTheme(dayIndex);
    const dayBudgetMin = Math.round(dailyBudget * 0.55);
    const dayBudgetMax = Math.round(dailyBudget * 0.9);

    return {
      id: `day_${dayIndex}`,
      dayIndex,
      title: `${input.destination} Day ${dayIndex}: ${dayTheme.title}`,
      theme: dayTheme.theme,
      areaFocus: [`${input.destination} central area`, `${input.destination} local district`],
      summary: `A ${paceLabel} day in ${input.destination} built around ${input.interests
        .slice(0, 3)
        .join(", ")} with estimated route and budget assumptions.`,
      activities: dayTheme.activities.map((title, activityOffset) => {
        const activityIndex = activityOffset + 1;
        const type = getActivityType(activityIndex, input.interests);
        const timeSlots = ["morning", "lunch", "afternoon"] as const;
        const startTimes = ["09:30", "12:30", "15:00"];
        const minBudget =
          activityIndex === 2 ? Math.round(dailyBudget * 0.18) : Math.round(dailyBudget * 0.08);
        const maxBudget =
          activityIndex === 2 ? Math.round(dailyBudget * 0.3) : Math.round(dailyBudget * 0.18);

        return {
          id: `d${dayIndex}_a${activityIndex}`,
          title: `${input.destination} ${title}`,
          type,
          timeSlot: timeSlots[activityOffset],
          startTime: startTimes[activityOffset],
          durationMinutes: activityIndex === 2 ? 90 : 120,
          location: {
            name: `${input.destination} ${title}`,
            address: null,
            area: `${input.destination} planning area ${dayIndex}`,
            lat: null,
            lng: null,
            placeId: null,
            sourceStatus: "estimated" as const,
          },
          budget: {
            currency: input.currency,
            min: minBudget,
            max: maxBudget,
            category: activityIndex === 2 ? ("food" as const) : ("ticket" as const),
            confidence: 0.62,
          },
          restaurant:
            activityIndex === 2
              ? {
                  name: `${input.destination} local food cluster`,
                  cuisine: "Local food",
                  mealType: "lunch" as const,
                  budget: {
                    currency: input.currency,
                    min: minBudget,
                    max: maxBudget,
                    category: "food" as const,
                    confidence: 0.62,
                  },
                  dietaryFit: [],
                  routeFitReason: `Keeps lunch close to the ${input.destination} day route.`,
                  sourceStatus: "estimated" as const,
                  confidence: 0.62,
                }
              : null,
          transportToNext:
            activityIndex < 3
              ? {
                  fromActivityId: `d${dayIndex}_a${activityIndex}`,
                  toActivityId: `d${dayIndex}_a${activityIndex + 1}`,
                  mode: transportMode,
                  estimatedDurationMinutes: input.pace === "relaxed" ? 25 : 18,
                  distanceRisk: "unknown" as const,
                  notes: `Estimated ${transportMode} transfer inside ${input.destination}. Verify with a live map before departure.`,
                  sourceStatus: "estimated" as const,
                }
              : null,
          reason: `This stop matches your ${input.interests.slice(0, 2).join(" and ")} interests while keeping Day ${dayIndex} grouped within ${input.destination}.`,
          userValue: `You get a practical ${input.destination} experience without needing to write a detailed prompt.`,
          sourceStatus: "estimated" as const,
          confidence: 0.66,
          warnings: [
            {
              code: "DEMO_PLACE_DATA",
              message:
                "This demo plan uses destination-aware placeholders until live place data is connected.",
              severity: "info" as const,
              fixStrategy: "Connect map and place APIs in V1 for verified venue names.",
            },
          ],
          alternatives: [],
        };
      }),
      dailyBudget: {
        currency: input.currency,
        min: dayBudgetMin,
        max: dayBudgetMax,
        food: Math.round(dailyBudget * 0.35),
        transport: Math.round(dailyBudget * 0.15),
        tickets: Math.round(dailyBudget * 0.2),
        shoppingBuffer: Math.round(dailyBudget * 0.15),
        confidence: 0.64,
      },
      routeRisk: "unknown" as const,
      paceRisk: input.pace === "packed" ? ("medium" as const) : ("low" as const),
      warnings: [],
    };
  });

  return {
    id: `trip_${slugify(input.destination) || "demo"}_${input.days}d`,
    destination: input.destination,
    durationDays: input.days,
    title: `${input.destination} ${input.days}-Day AI Travel Plan`,
    summary: `A fast demo itinerary for ${input.destination}, personalized around ${input.interests.join(", ")} with ${paceLabel} pacing and ${input.currency} ${input.budget} budget context.`,
    hotelRecommendation: {
      area: `${input.destination} central transit-friendly area`,
      fitReason: `A central base reduces first-time route risk and keeps daily travel inside ${input.destination} simpler.`,
      pros: ["Good transit access", "Lower route complexity", "Easy to adjust daily plans"],
      cons: [
        "Exact hotel availability is not connected yet",
        "Live neighborhood pricing is not verified",
      ],
      sourceStatus: "estimated",
      confidence: 0.62,
    },
    days,
    totalBudget: {
      currency: input.currency,
      min: Math.round(input.budget * 0.55),
      max: Math.round(input.budget * 0.95),
      confidence: 0.64,
    },
    metadata: {
      promptVersion: "demo-destination-aware-v1",
      model: "mock-fast-demo",
      locale: "en",
      generatedAt: new Date().toISOString(),
      inputHash: `demo-${slugify(input.destination)}-${input.days}-${input.budget}`,
      retries: 0,
    },
    explain: {
      summary: `The plan is generated from your Planner input so the Timeline reflects ${input.destination}, not a fixed Tokyo template.`,
      routeLogic: [
        `Each day is grouped around broad ${input.destination} areas to reduce route complexity.`,
        "Live map routing is intentionally marked as estimated in the demo.",
      ],
      budgetLogic: [
        `Daily budget is derived from your total ${input.currency} ${input.budget} budget.`,
        "Food, transport, tickets, and shopping are split into estimated buckets.",
      ],
      personalization: [
        `Interests used: ${input.interests.join(", ")}.`,
        `Pace used: ${input.pace}.`,
        `Transportation preference used: ${input.transportation}.`,
      ],
      tradeoffs: [
        "The demo prioritizes speed and destination relevance over verified place-level precision.",
        "V1 should replace placeholders with map-verified venues and opening hours.",
      ],
      verificationNeeded: ["Specific venue names", "Opening hours", "Weather", "Live route times"],
    },
    warnings: [
      {
        code: "FAST_DEMO_MODE",
        message:
          "This is a fast destination-aware demo plan. Live OpenAI, map, weather, and place verification can be connected in V1.",
        severity: "info",
        fixStrategy: "Use the AI Planning Engine and place APIs for production generation.",
      },
    ],
    confidence: 0.66,
  };
}
