import { plannerInputSchema, type PlannerInput } from "@/schemas/planner.schema";

import type { AIEngineLocale, RequirementContext } from "../types/engine.types";

export function parseRequirements(
  input: unknown,
  locale: AIEngineLocale = "en",
): RequirementContext {
  const normalizedInput = plannerInputSchema.parse(input);
  const hardConstraints = [
    `Destination: ${normalizedInput.destination}`,
    `Duration: ${normalizedInput.days} day(s)`,
    `Total budget: ${normalizedInput.currency} ${normalizedInput.budget}`,
    `Transportation: ${normalizedInput.transportation}`,
    `Accessibility: ${normalizedInput.accessibility}`,
  ];

  const softPreferences = [
    `Travel style: ${normalizedInput.travelStyle}`,
    `Pace: ${normalizedInput.pace}`,
    `Companion: ${normalizedInput.companion}`,
    `Travel goal: ${normalizedInput.travelGoal}`,
    `Interests: ${normalizedInput.interests.join(", ")}`,
    `Food preference: ${normalizedInput.foodPreference}`,
    `Language preference: ${normalizedInput.language}`,
  ];

  if (normalizedInput.specialRequirement) {
    softPreferences.push(`Special requirement: ${normalizedInput.specialRequirement}`);
  }

  if (normalizedInput.mustVisitPlaces) {
    hardConstraints.push(`Must-visit places: ${normalizedInput.mustVisitPlaces}`);
  }

  if (normalizedInput.avoidPlaces) {
    hardConstraints.push(`Avoid places: ${normalizedInput.avoidPlaces}`);
  }

  const riskSignals = buildRiskSignals(normalizedInput);

  return {
    normalizedInput,
    locale,
    userIntent: `Plan a ${normalizedInput.days}-day trip to ${normalizedInput.destination}.`,
    hardConstraints,
    softPreferences,
    riskSignals,
    missingFields: [],
  };
}

function buildRiskSignals(input: PlannerInput) {
  const signals: string[] = [];

  if (input.days <= 2 && input.interests.length > 4) {
    signals.push("Short trip with many interests; prioritize aggressively.");
  }

  if (input.budget / input.days < 80 && input.currency !== "JPY") {
    signals.push("Budget appears tight; favor free or low-cost activities.");
  }

  if (input.pace === "packed" && input.accessibility !== "none") {
    signals.push("Packed pace may conflict with accessibility needs.");
  }

  if (!input.hasHotel && input.accommodation === "not-booked") {
    signals.push("Hotel is not booked; avoid over-optimizing around a specific hotel area.");
  }

  return signals;
}
