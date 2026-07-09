export type PromptName =
  "requirement-parser" | "trip-planner" | "trip-modifier" | "budget" | "weather" | "explain";

export type PromptRegistryEntry = {
  name: PromptName;
  version: string;
  description: string;
};

export const promptRegistry: Record<PromptName, PromptRegistryEntry> = {
  "requirement-parser": {
    name: "requirement-parser",
    version: "v0",
    description: "Reserved prompt slot for parsing user trip requirements.",
  },
  "trip-planner": {
    name: "trip-planner",
    version: "v0",
    description: "Reserved prompt slot for generating structured travel plans.",
  },
  "trip-modifier": {
    name: "trip-modifier",
    version: "v0",
    description: "Reserved prompt slot for local trip modifications.",
  },
  budget: {
    name: "budget",
    version: "v0",
    description: "Reserved prompt slot for budget analysis and optimization.",
  },
  weather: {
    name: "weather",
    version: "v0",
    description: "Reserved prompt slot for weather-aware replanning.",
  },
  explain: {
    name: "explain",
    version: "v0",
    description: "Reserved prompt slot for user-facing explanations.",
  },
};
