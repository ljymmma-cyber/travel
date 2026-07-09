import type { TravelPlan } from "../schemas/travel-plan.schema";
import type { AIEngineLog } from "../types/engine.types";

export type FormattedTravelPlanResponse = {
  plan: TravelPlan;
  diagnostics: {
    promptVersion: string;
    model: string;
    latencyMs: number;
    retries: number;
    confidence: number;
  };
};

export function formatTravelPlanForFrontend(
  plan: TravelPlan,
  log: AIEngineLog,
): FormattedTravelPlanResponse {
  return {
    plan,
    diagnostics: {
      promptVersion: log.promptVersion,
      model: log.model,
      latencyMs: log.latencyMs,
      retries: log.retries,
      confidence: plan.confidence,
    },
  };
}
