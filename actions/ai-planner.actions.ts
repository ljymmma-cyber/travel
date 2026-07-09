"use server";

import { generateTravelPlan } from "@/features/ai/planner/planning-engine";
import { plannerInputSchema, type PlannerInput } from "@/schemas/planner.schema";

export async function generateTravelPlanAction(input: PlannerInput) {
  const parsedInput = plannerInputSchema.parse(input);

  return generateTravelPlan(parsedInput);
}
