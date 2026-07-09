import type { PlanningContext } from "../types/engine.types";
import { getPlannerPrompt, type PlannerPromptVersion } from "../prompts/registry";
import {
  buildModelMessages,
  renderPromptPart,
  type ModelMessage,
  type PromptVariableValue,
} from "../prompts/prompt-template";

export type BuiltPlannerPrompt = {
  version: PlannerPromptVersion;
  temperature: number;
  messages: ModelMessage[];
};

const jsonSchemaSummary = [
  "id",
  "destination",
  "durationDays",
  "title",
  "summary",
  "hotelRecommendation",
  "days[]",
  "totalBudget",
  "metadata",
  "explain",
  "warnings",
  "confidence",
].join(", ");

export function buildPlannerPrompt(
  context: PlanningContext,
  version?: PlannerPromptVersion,
): BuiltPlannerPrompt {
  const registryEntry = getPlannerPrompt(version);
  const variables: Record<string, PromptVariableValue> = {
    locale: context.requirement.locale,
    destination: context.requirement.normalizedInput.destination,
    durationDays: context.requirement.normalizedInput.days,
    generatedAt: context.generatedAt,
    inputHash: context.inputHash,
    assumptions: context.assumptions,
    hardConstraints: context.requirement.hardConstraints,
    softPreferences: context.requirement.softPreferences,
    riskSignals: context.requirement.riskSignals,
    userIntent: context.requirement.userIntent,
    jsonSchemaSummary,
  };

  const renderedParts = registryEntry.templates.map((template) =>
    renderPromptPart(template, variables),
  );

  return {
    version: registryEntry.version,
    temperature: registryEntry.temperature,
    messages: buildModelMessages(renderedParts),
  };
}
