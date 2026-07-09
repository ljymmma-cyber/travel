import type { RequirementContext, PlanningContext } from "../types/engine.types";
import { stableHash } from "../utils/hash";

export function buildPlanningContext(
  requirement: RequirementContext,
  now = new Date(),
): PlanningContext {
  return {
    requirement,
    generatedAt: now.toISOString(),
    inputHash: stableHash(requirement.normalizedInput),
    assumptions: buildAssumptions(requirement),
  };
}

function buildAssumptions(requirement: RequirementContext) {
  const { normalizedInput } = requirement;
  const assumptions: string[] = [];

  if (!normalizedInput.hasFlights) {
    assumptions.push(
      "Flight arrival and departure times are unknown; avoid first-day and last-day overpacking.",
    );
  }

  if (!normalizedInput.hasHotel) {
    assumptions.push(
      "Hotel location is unknown; group activities by area instead of anchoring around a hotel.",
    );
  }

  if (normalizedInput.visa === "not-sure" || normalizedInput.visa === "need-check") {
    assumptions.push("Visa status may need verification before booking non-refundable activities.");
  }

  if (normalizedInput.accommodation === "need-suggestion") {
    assumptions.push("Include a hotel area recommendation but do not invent a specific booking.");
  }

  return assumptions.length > 0 ? assumptions : ["No additional assumptions."];
}
