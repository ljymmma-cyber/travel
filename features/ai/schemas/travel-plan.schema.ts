import { z } from "zod";

export const confidenceSchema = z.number().min(0).max(1);

export const sourceStatusSchema = z.enum(["verified", "estimated", "unverified", "unavailable"]);

export const aiWarningSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(["info", "warning", "critical"]),
  fixStrategy: z.string().optional(),
});

export const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().nullable(),
  area: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  placeId: z.string().nullable(),
  sourceStatus: sourceStatusSchema,
});

export const budgetSchema = z.object({
  currency: z.enum(["USD", "HKD", "CNY", "JPY", "EUR", "GBP"]),
  min: z.number().min(0),
  max: z.number().min(0),
  category: z.enum(["food", "ticket", "transport", "shopping", "hotel", "other"]),
  confidence: confidenceSchema,
});

export const restaurantSchema = z.object({
  name: z.string().min(1),
  cuisine: z.string().nullable(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "cafe", "snack"]),
  budget: budgetSchema,
  dietaryFit: z.array(z.string()).default([]),
  routeFitReason: z.string().min(1),
  sourceStatus: sourceStatusSchema,
  confidence: confidenceSchema,
});

export const hotelSchema = z.object({
  area: z.string().min(1),
  fitReason: z.string().min(1),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  sourceStatus: sourceStatusSchema,
  confidence: confidenceSchema,
});

export const transportSchema = z.object({
  fromActivityId: z.string().nullable(),
  toActivityId: z.string().nullable(),
  mode: z.enum(["walk", "public-transit", "taxi", "rental-car", "mixed", "unknown"]),
  estimatedDurationMinutes: z.number().int().min(0).nullable(),
  distanceRisk: z.enum(["low", "medium", "high", "unknown"]),
  notes: z.string().default(""),
  sourceStatus: sourceStatusSchema,
});

export const activitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum([
    "attraction",
    "restaurant",
    "cafe",
    "shopping",
    "museum",
    "nature",
    "transport",
    "rest",
    "hotel",
    "free-time",
  ]),
  timeSlot: z.enum(["morning", "lunch", "afternoon", "dinner", "evening", "flexible"]),
  startTime: z.string().nullable(),
  durationMinutes: z.number().int().min(0).max(720),
  location: locationSchema,
  budget: budgetSchema,
  restaurant: restaurantSchema.nullable(),
  transportToNext: transportSchema.nullable(),
  reason: z.string().min(1),
  userValue: z.string().min(1),
  sourceStatus: sourceStatusSchema,
  confidence: confidenceSchema,
  warnings: z.array(aiWarningSchema).default([]),
  alternatives: z
    .array(
      z.object({
        title: z.string().min(1),
        reason: z.string().min(1),
        tradeoff: z.string().min(1),
        confidence: confidenceSchema,
      }),
    )
    .default([]),
});

export const dayPlanSchema = z.object({
  id: z.string().min(1),
  dayIndex: z.number().int().min(1),
  title: z.string().min(1),
  theme: z.string().min(1),
  areaFocus: z.array(z.string()).min(1),
  summary: z.string().min(1),
  activities: z.array(activitySchema).min(1),
  dailyBudget: z.object({
    currency: z.enum(["USD", "HKD", "CNY", "JPY", "EUR", "GBP"]),
    min: z.number().min(0),
    max: z.number().min(0),
    food: z.number().min(0),
    transport: z.number().min(0),
    tickets: z.number().min(0),
    shoppingBuffer: z.number().min(0),
    confidence: confidenceSchema,
  }),
  routeRisk: z.enum(["low", "medium", "high", "unknown"]),
  paceRisk: z.enum(["low", "medium", "high"]),
  warnings: z.array(aiWarningSchema).default([]),
});

export const planMetadataSchema = z.object({
  promptVersion: z.string().min(1),
  model: z.string().min(1),
  locale: z.string().min(1),
  generatedAt: z.string().min(1),
  inputHash: z.string().min(1),
  retries: z.number().int().min(0),
});

export const explainSchema = z.object({
  summary: z.string().min(1),
  routeLogic: z.array(z.string()).default([]),
  budgetLogic: z.array(z.string()).default([]),
  personalization: z.array(z.string()).default([]),
  tradeoffs: z.array(z.string()).default([]),
  verificationNeeded: z.array(z.string()).default([]),
});

export const travelPlanSchema = z
  .object({
    id: z.string().min(1),
    destination: z.string().min(1),
    durationDays: z.number().int().min(1).max(30),
    title: z.string().min(1),
    summary: z.string().min(1),
    hotelRecommendation: hotelSchema.nullable(),
    days: z.array(dayPlanSchema).min(1).max(30),
    totalBudget: z.object({
      currency: z.enum(["USD", "HKD", "CNY", "JPY", "EUR", "GBP"]),
      min: z.number().min(0),
      max: z.number().min(0),
      confidence: confidenceSchema,
    }),
    metadata: planMetadataSchema,
    explain: explainSchema,
    warnings: z.array(aiWarningSchema).default([]),
    confidence: confidenceSchema,
  })
  .superRefine((plan, ctx) => {
    if (plan.days.length !== plan.durationDays) {
      ctx.addIssue({
        code: "custom",
        path: ["days"],
        message: "The number of DayPlan items must match durationDays.",
      });
    }

    if (plan.totalBudget.max < plan.totalBudget.min) {
      ctx.addIssue({
        code: "custom",
        path: ["totalBudget"],
        message: "totalBudget.max must be greater than or equal to totalBudget.min.",
      });
    }
  });

export type AIWarning = z.infer<typeof aiWarningSchema>;
export type Budget = z.infer<typeof budgetSchema>;
export type Restaurant = z.infer<typeof restaurantSchema>;
export type Hotel = z.infer<typeof hotelSchema>;
export type Transport = z.infer<typeof transportSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type DayPlan = z.infer<typeof dayPlanSchema>;
export type PlanMetadata = z.infer<typeof planMetadataSchema>;
export type Explain = z.infer<typeof explainSchema>;
export type TravelPlan = z.infer<typeof travelPlanSchema>;
