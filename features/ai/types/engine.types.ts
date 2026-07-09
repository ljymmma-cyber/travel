import type { PlannerInput } from "@/schemas/planner.schema";

import type { TravelPlan } from "../schemas/travel-plan.schema";
import type { ModelMessage } from "../prompts/prompt-template";

export type AIEngineLocale = "en" | "zh";
export type AIEngineRole = "system" | "developer" | "user" | "context" | "constraint";
export type AIEngineTone = "concise" | "professional" | "supportive";
export type AIEngineStyle = "json-only" | "explanatory";

export type RequirementContext = {
  normalizedInput: PlannerInput;
  locale: AIEngineLocale;
  userIntent: string;
  hardConstraints: string[];
  softPreferences: string[];
  riskSignals: string[];
  missingFields: string[];
};

export type PlanningContext = {
  requirement: RequirementContext;
  generatedAt: string;
  inputHash: string;
  assumptions: string[];
};

export type AIEngineSuccess = {
  ok: true;
  plan: TravelPlan;
  log: AIEngineLog;
};

export type AIEngineFailure = {
  ok: false;
  error: AIEngineError;
  log: AIEngineLog;
};

export type AIEngineResult = AIEngineSuccess | AIEngineFailure;

export type AIEngineLog = {
  requestId: string;
  promptVersion: string;
  model: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd: number | null;
  retries: number;
  success: boolean;
  errorCode: AIEngineErrorCode | null;
};

export type AIModelRequest = {
  messages: ModelMessage[];
  model?: string;
  temperature?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  metadata?: Record<string, string | number | boolean>;
};

export type AIModelResponse = {
  rawText: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
};

export type AIModelClient = {
  requestJson: (request: AIModelRequest) => Promise<AIModelResponse>;
};

export type AIEngineErrorCode =
  | "OPENAI_ERROR"
  | "NETWORK_ERROR"
  | "JSON_ERROR"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "PROMPT_INJECTION"
  | "HALLUCINATION_RISK"
  | "UNKNOWN";

export type AIEngineError = {
  code: AIEngineErrorCode;
  message: string;
  retryable: boolean;
  fallback: string;
  cause?: unknown;
};
