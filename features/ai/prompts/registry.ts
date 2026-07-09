import type { PromptTemplate } from "./prompt-template";
import {
  plannerV1PromptParts,
  plannerV2PromptParts,
  plannerV3PromptParts,
} from "./planner-prompts";

export type PlannerPromptVersion = "planner-v1" | "planner-v2" | "planner-v3";

export type PromptRegistryEntry = {
  version: PlannerPromptVersion;
  status: "active" | "experimental" | "reserved";
  description: string;
  temperature: number;
  templates: PromptTemplate[];
};

export const defaultPlannerPromptVersion: PlannerPromptVersion = "planner-v1";

export const plannerPromptRegistry: Record<PlannerPromptVersion, PromptRegistryEntry> = {
  "planner-v1": {
    version: "planner-v1",
    status: "active",
    description: "MVP planning prompt optimized for executable JSON itineraries.",
    temperature: 0.4,
    templates: plannerV1PromptParts,
  },
  "planner-v2": {
    version: "planner-v2",
    status: "experimental",
    description: "Reserved for route-aware planner experiments.",
    temperature: 0.35,
    templates: plannerV2PromptParts,
  },
  "planner-v3": {
    version: "planner-v3",
    status: "reserved",
    description: "Reserved for agentic tool-calling planner experiments.",
    temperature: 0.3,
    templates: plannerV3PromptParts,
  },
};

export function getPlannerPrompt(version: PlannerPromptVersion = defaultPlannerPromptVersion) {
  return plannerPromptRegistry[version];
}
