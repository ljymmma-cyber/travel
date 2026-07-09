import { z } from "zod";

import { travelPlanSchema } from "@/features/ai/schemas/travel-plan.schema";

export const tripStatusSchema = z.enum([
  "draft",
  "planned",
  "in_progress",
  "completed",
  "archived",
]);

export const workspaceTripSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).nullable(),
  title: z.string().min(1),
  destination: z.string().min(1),
  coverGradient: z.string().min(1),
  status: tripStatusSchema,
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  updatedAt: z.string().min(1),
  createdAt: z.string().min(1),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  currency: z.enum(["USD", "HKD", "CNY", "JPY", "EUR", "GBP"]),
  versionCount: z.number().int().min(1),
  plan: travelPlanSchema,
});

export const tripVersionSchema = z.object({
  id: z.string().min(1),
  tripId: z.string().min(1),
  versionNumber: z.number().int().min(1),
  label: z.string().min(1),
  createdAt: z.string().min(1),
  createdBy: z.enum(["ai_generate", "manual_edit", "partial_replan", "restore"]),
  summary: z.string().min(1),
  plan: travelPlanSchema,
});

export const userPreferenceSchema = z.object({
  userId: z.string().min(1),
  homeCurrency: z.enum(["USD", "HKD", "CNY", "JPY", "EUR", "GBP"]).default("USD"),
  preferredPace: z.enum(["relaxed", "balanced", "packed"]).default("balanced"),
  interests: z.array(z.string()).default([]),
  accessibility: z
    .enum(["none", "low-walking", "wheelchair", "stroller", "senior-friendly"])
    .default("none"),
  updatedAt: z.string().min(1),
});

export const tripFiltersSchema = z.object({
  query: z.string().default(""),
  status: z.union([tripStatusSchema, z.literal("all")]).default("all"),
  favoriteOnly: z.boolean().default(false),
  sortBy: z
    .enum(["updated_desc", "updated_asc", "destination", "budget_desc"])
    .default("updated_desc"),
});

export type TripStatus = z.infer<typeof tripStatusSchema>;
export type WorkspaceTrip = z.infer<typeof workspaceTripSchema>;
export type TripVersion = z.infer<typeof tripVersionSchema>;
export type UserPreference = z.infer<typeof userPreferenceSchema>;
export type TripFilters = z.infer<typeof tripFiltersSchema>;
