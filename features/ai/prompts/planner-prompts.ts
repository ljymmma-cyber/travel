import type { PromptTemplate } from "./prompt-template";

const sharedJsonConstraints = [
  "Return valid JSON only.",
  "Do not wrap the JSON in Markdown.",
  "Do not include commentary outside the JSON object.",
  "Use null when a field cannot be verified.",
  "Mark uncertain place, time, route, and budget data as estimated or unverified.",
];

export const plannerV1PromptParts: PromptTemplate[] = [
  {
    id: "planner-v1-system",
    version: "planner-v1",
    locale: "en",
    role: "system",
    style: "json-only",
    tone: "professional",
    constraints: sharedJsonConstraints,
    variables: ["locale"],
    template:
      "You are AI Travel Planner, a planning engine for first-time independent travelers. Your job is to make executable travel decisions, not write a guide. Respond in locale: {{locale}}.",
  },
  {
    id: "planner-v1-developer",
    version: "planner-v1",
    locale: "en",
    role: "developer",
    style: "json-only",
    tone: "professional",
    constraints: [
      "Prioritize route practicality over novelty.",
      "Prefer fewer high-quality decisions over overloaded itineraries.",
      "Every activity must include a concrete reason and user value.",
    ],
    variables: ["jsonSchemaSummary"],
    template:
      "Produce a TravelPlan object matching this schema summary. Required top-level keys: {{jsonSchemaSummary}}",
  },
  {
    id: "planner-v1-context",
    version: "planner-v1",
    locale: "en",
    role: "context",
    style: "json-only",
    tone: "concise",
    constraints: [],
    variables: ["destination", "durationDays", "generatedAt", "inputHash", "assumptions"],
    template:
      "Planning context:\nDestination: {{destination}}\nDuration days: {{durationDays}}\nGenerated at: {{generatedAt}}\nInput hash: {{inputHash}}\nAssumptions:\n{{assumptions}}",
  },
  {
    id: "planner-v1-constraint",
    version: "planner-v1",
    locale: "en",
    role: "constraint",
    style: "json-only",
    tone: "concise",
    constraints: [
      "Hard constraints must be respected unless impossible.",
      "If a hard constraint creates risk, add a warning with a fixStrategy.",
      "Soft preferences should influence ranking but must not break feasibility.",
    ],
    variables: ["hardConstraints", "softPreferences", "riskSignals"],
    template:
      "Hard constraints:\n{{hardConstraints}}\n\nSoft preferences:\n{{softPreferences}}\n\nRisk signals:\n{{riskSignals}}",
  },
  {
    id: "planner-v1-user",
    version: "planner-v1",
    locale: "en",
    role: "user",
    style: "json-only",
    tone: "supportive",
    constraints: sharedJsonConstraints,
    variables: ["userIntent"],
    template: "{{userIntent}} Generate the itinerary now.",
  },
];

export const plannerV2PromptParts: PromptTemplate[] = plannerV1PromptParts.map((part) => ({
  ...part,
  id: part.id.replace("planner-v1", "planner-v2"),
  version: "planner-v2",
}));

export const plannerV3PromptParts: PromptTemplate[] = plannerV1PromptParts.map((part) => ({
  ...part,
  id: part.id.replace("planner-v1", "planner-v3"),
  version: "planner-v3",
}));
