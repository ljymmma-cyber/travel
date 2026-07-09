import { z } from "zod";

export const replanActionSchema = z.enum([
  "modify_day",
  "replace_activity",
  "delete_activity",
  "insert_activity",
  "change_budget",
  "change_pace",
  "avoid_crowds",
  "more_food",
  "more_shopping",
  "more_museums",
  "rain_plan",
  "family_friendly",
  "accessibility",
]);

export const replanReasonSchema = z.enum([
  "not_enough_time",
  "not_interested",
  "too_expensive",
  "too_far",
  "weather",
  "too_crowded",
  "accessibility",
  "family_need",
  "custom",
]);

export const jsonPatchOperationSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("add"),
    path: z.string().min(1),
    value: z.unknown(),
    reason: z.string().min(1),
  }),
  z.object({
    op: z.literal("remove"),
    path: z.string().min(1),
    reason: z.string().min(1),
  }),
  z.object({
    op: z.literal("replace"),
    path: z.string().min(1),
    value: z.unknown(),
    reason: z.string().min(1),
  }),
  z.object({
    op: z.literal("move"),
    from: z.string().min(1),
    path: z.string().min(1),
    reason: z.string().min(1),
  }),
]);

export const constraintInputSchema = z.object({
  budgetMax: z.number().min(0).optional(),
  pace: z.enum(["relaxed", "balanced", "packed"]).optional(),
  weather: z.enum(["sunny", "cloudy", "rain", "storm"]).optional(),
  avoidCrowds: z.boolean().default(false),
  accessibility: z
    .enum(["none", "low-walking", "wheelchair", "stroller", "senior-friendly"])
    .optional(),
  keepFavorites: z.boolean().default(true),
});

export const replanRequestSchema = z.object({
  action: replanActionSchema,
  targetDayId: z.string().min(1),
  targetActivityId: z.string().min(1).optional(),
  reasons: z.array(replanReasonSchema).min(1),
  customInstruction: z.string().trim().max(500).optional(),
  lockedActivityIds: z.array(z.string()).default([]),
  favoriteActivityIds: z.array(z.string()).default([]),
  constraints: constraintInputSchema.default({ avoidCrowds: false, keepFavorites: true }),
});

export const replanPatchResponseSchema = z.object({
  patches: z.array(jsonPatchOperationSchema).min(1).max(12),
  explanation: z.object({
    summary: z.string().min(1),
    changed: z.array(z.string()).default([]),
    preserved: z.array(z.string()).default([]),
    constraintChecks: z.array(z.string()).default([]),
    riskNotes: z.array(z.string()).default([]),
  }),
  metadata: z.object({
    targetDayId: z.string().min(1),
    changedActivityIds: z.array(z.string()).default([]),
    preservedDayIds: z.array(z.string()).default([]),
    lockedActivityIds: z.array(z.string()).default([]),
    promptVersion: z.string().min(1),
  }),
});

export type ReplanAction = z.infer<typeof replanActionSchema>;
export type ReplanReason = z.infer<typeof replanReasonSchema>;
export type JsonPatchOperation = z.infer<typeof jsonPatchOperationSchema>;
export type ReplanRequest = z.infer<typeof replanRequestSchema>;
export type ReplanPatchResponse = z.infer<typeof replanPatchResponseSchema>;
