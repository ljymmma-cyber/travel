import { fallbackForError, OpenAIPlanningClient } from "../client/openai-planning-client";
import { diffTravelPlans, type TravelPlanDiff } from "../diff/travel-plan-diff";
import type {
  AIEngineError,
  AIEngineLog,
  AIModelClient,
  AIModelResponse,
} from "../types/engine.types";
import type { TravelPlan } from "../schemas/travel-plan.schema";
import {
  replanPatchResponseSchema,
  replanRequestSchema,
  type ReplanPatchResponse,
  type ReplanRequest,
} from "../schemas/replanning.schema";
import { applyTravelPlanPatch } from "./json-patch";
import { buildModifyPrompt, modifyPromptVersion } from "./modify-prompt-builder";
import { validateReplanPatchScope } from "./patch-validator";

export type ReplanSuccess = {
  ok: true;
  plan: TravelPlan;
  patchResponse: ReplanPatchResponse;
  diff: TravelPlanDiff;
  log: AIEngineLog;
};

export type ReplanFailure = {
  ok: false;
  error: AIEngineError;
  log: AIEngineLog;
};

export type ReplanResult = ReplanSuccess | ReplanFailure;

export type ReplanOptions = {
  model?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type ReplanDependencies = {
  modelClient?: AIModelClient;
  requestIdFactory?: () => string;
};

export async function partiallyReplanTravelPlan(
  plan: TravelPlan,
  request: ReplanRequest,
  options: ReplanOptions = {},
  deps: ReplanDependencies = {},
): Promise<ReplanResult> {
  const startedAt = performance.now();
  const requestId = deps.requestIdFactory?.() ?? crypto.randomUUID();
  const model = options.model ?? "gpt-4.1-mini";
  const modelClient = deps.modelClient ?? new OpenAIPlanningClient();
  const parsedRequest = replanRequestSchema.parse(request);
  let modelResponse: AIModelResponse | null = null;

  try {
    modelResponse = await modelClient.requestJson({
      messages: buildModifyPrompt(plan, parsedRequest),
      model,
      temperature: 0.2,
      timeoutMs: options.timeoutMs,
      signal: options.signal,
      metadata: {
        requestId,
        promptVersion: modifyPromptVersion,
        mode: "partial-replan",
      },
    });

    const patchResponse = parsePatchResponse(modelResponse.rawText);
    const scopeIssues = validateReplanPatchScope(plan, parsedRequest, patchResponse.patches);

    if (scopeIssues.length > 0) {
      const error: AIEngineError = {
        code: "VALIDATION_ERROR",
        message: scopeIssues[0]?.message ?? "Patch is outside the allowed replanning scope.",
        retryable: true,
        fallback:
          "Ask AI to return a smaller patch that only touches the target day and respects locked items.",
        cause: scopeIssues,
      };

      return failureResult(error, requestId, model, startedAt, modelResponse);
    }

    const applyResult = applyTravelPlanPatch(plan, patchResponse.patches);

    if (!applyResult.ok) {
      const error: AIEngineError = {
        code: "VALIDATION_ERROR",
        message: applyResult.error,
        retryable: true,
        fallback: "Retry with a valid JSON Patch that preserves the TravelPlan schema.",
        cause: applyResult,
      };

      return failureResult(error, requestId, model, startedAt, modelResponse);
    }

    const diff = diffTravelPlans(plan, applyResult.plan);

    return {
      ok: true,
      plan: applyResult.plan,
      patchResponse,
      diff,
      log: buildReplanLog({
        requestId,
        model,
        startedAt,
        success: true,
        errorCode: null,
        response: modelResponse,
      }),
    };
  } catch (error) {
    return failureResult(normalizeReplanError(error), requestId, model, startedAt, modelResponse);
  }
}

function parsePatchResponse(rawText: string): ReplanPatchResponse {
  const parsed = JSON.parse(rawText);
  return replanPatchResponseSchema.parse(parsed);
}

function failureResult(
  error: AIEngineError,
  requestId: string,
  model: string,
  startedAt: number,
  response: AIModelResponse | null,
): ReplanFailure {
  return {
    ok: false,
    error,
    log: buildReplanLog({
      requestId,
      model,
      startedAt,
      success: false,
      errorCode: error.code,
      response,
    }),
  };
}

function buildReplanLog(input: {
  requestId: string;
  model: string;
  startedAt: number;
  success: boolean;
  errorCode: AIEngineLog["errorCode"];
  response: AIModelResponse | null;
}): AIEngineLog {
  return {
    requestId: input.requestId,
    promptVersion: modifyPromptVersion,
    model: input.response?.model ?? input.model,
    latencyMs: Math.round(performance.now() - input.startedAt),
    inputTokens: input.response?.inputTokens ?? null,
    outputTokens: input.response?.outputTokens ?? null,
    estimatedCostUsd: null,
    retries: 0,
    success: input.success,
    errorCode: input.errorCode,
  };
}

function normalizeReplanError(error: unknown): AIEngineError {
  if (error && typeof error === "object" && "code" in error && "fallback" in error) {
    return error as AIEngineError;
  }

  if (error instanceof SyntaxError) {
    return {
      code: "JSON_ERROR",
      message: error.message,
      retryable: true,
      fallback: fallbackForError("JSON_ERROR"),
      cause: error,
    };
  }

  return {
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Partial replanning failed.",
    retryable: false,
    fallback: fallbackForError("UNKNOWN"),
    cause: error,
  };
}
