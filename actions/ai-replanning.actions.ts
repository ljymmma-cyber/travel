"use server";

import { partiallyReplanTravelPlan } from "@/features/ai/replanning/replanning-engine";
import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";
import { replanRequestSchema, type ReplanRequest } from "@/features/ai/schemas/replanning.schema";

export async function partiallyReplanTravelPlanAction(plan: TravelPlan, request: ReplanRequest) {
  const parsedRequest = replanRequestSchema.parse(request);

  return partiallyReplanTravelPlan(plan, parsedRequest);
}
