import type { PlannerInput } from "@/schemas/planner.schema";

import { OpenAIPlanningClient, fallbackForError } from "../client/openai-planning-client";
import { formatTravelPlanForFrontend } from "../formatter/response-formatter";
import { parseRequirements } from "../parser/requirement-parser";
import { buildRepairMessages, shouldRepair } from "../repair/repair-strategy";
import { validateTravelPlanOutput } from "../validator/json-validator";
import type { PlannerPromptVersion } from "../prompts/registry";
import type {
  AIEngineError,
  AIEngineResult,
  AIModelClient,
  AIModelResponse,
} from "../types/engine.types";
import { buildPlanningContext } from "./context-builder";
import { buildPlannerPrompt } from "./prompt-builder";

export type GenerateTravelPlanOptions = {
  promptVersion?: PlannerPromptVersion;
  model?: string;
  locale?: "en" | "zh";
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type PlanningEngineDependencies = {
  modelClient?: AIModelClient;
  now?: () => Date;
  requestIdFactory?: () => string;
};

export async function generateTravelPlan(
  input: PlannerInput,
  options: GenerateTravelPlanOptions = {},
  deps: PlanningEngineDependencies = {},
): Promise<AIEngineResult> {
  const startedAt = performance.now();
  const modelClient = deps.modelClient ?? new OpenAIPlanningClient();
  const requestId = deps.requestIdFactory?.() ?? crypto.randomUUID();
  const requirement = parseRequirements(input, options.locale ?? "en");
  const context = buildPlanningContext(requirement, deps.now?.() ?? new Date());
  const prompt = buildPlannerPrompt(context, options.promptVersion);
  const model = options.model ?? "gpt-4.1-mini";

  let retries = 0;
  let lastModelResponse: AIModelResponse | null = null;

  try {
    lastModelResponse = await modelClient.requestJson({
      messages: prompt.messages,
      model,
      temperature: prompt.temperature,
      timeoutMs: options.timeoutMs,
      signal: options.signal,
      metadata: {
        requestId,
        promptVersion: prompt.version,
      },
    });

    let validation = validateTravelPlanOutput(lastModelResponse.rawText);

    while (!validation.ok && shouldRepair(retries)) {
      retries += 1;
      lastModelResponse = await modelClient.requestJson({
        messages: buildRepairMessages({
          rawOutput: validation.raw,
          validationErrors: validation.errors,
        }),
        model,
        temperature: 0,
        timeoutMs: options.timeoutMs,
        signal: options.signal,
        metadata: {
          requestId,
          promptVersion: prompt.version,
          repairAttempt: retries,
        },
      });
      validation = validateTravelPlanOutput(lastModelResponse.rawText);
    }

    if (!validation.ok) {
      const error: AIEngineError = {
        code: validation.errors[0]?.code ?? "VALIDATION_ERROR",
        message: validation.errors[0]?.reason ?? "AI output failed validation.",
        retryable: true,
        fallback: fallbackForError(validation.errors[0]?.code ?? "VALIDATION_ERROR"),
        cause: validation.errors,
      };

      return {
        ok: false,
        error,
        log: buildLog({
          requestId,
          promptVersion: prompt.version,
          model,
          startedAt,
          retries,
          success: false,
          errorCode: error.code,
          response: lastModelResponse,
        }),
      };
    }

    const log = buildLog({
      requestId,
      promptVersion: prompt.version,
      model,
      startedAt,
      retries,
      success: true,
      errorCode: null,
      response: lastModelResponse,
    });

    const formatted = formatTravelPlanForFrontend(validation.data, log);

    return {
      ok: true,
      plan: formatted.plan,
      log,
    };
  } catch (error) {
    const engineError = normalizeEngineError(error);

    return {
      ok: false,
      error: engineError,
      log: buildLog({
        requestId,
        promptVersion: prompt.version,
        model,
        startedAt,
        retries,
        success: false,
        errorCode: engineError.code,
        response: lastModelResponse,
      }),
    };
  }
}

function buildLog(input: {
  requestId: string;
  promptVersion: string;
  model: string;
  startedAt: number;
  retries: number;
  success: boolean;
  errorCode: AIEngineResult["log"]["errorCode"];
  response: AIModelResponse | null;
}): AIEngineResult["log"] {
  return {
    requestId: input.requestId,
    promptVersion: input.promptVersion,
    model: input.response?.model ?? input.model,
    latencyMs: Math.round(performance.now() - input.startedAt),
    inputTokens: input.response?.inputTokens ?? null,
    outputTokens: input.response?.outputTokens ?? null,
    estimatedCostUsd: null,
    retries: input.retries,
    success: input.success,
    errorCode: input.errorCode,
  };
}

function normalizeEngineError(error: unknown): AIEngineError {
  if (isAIEngineError(error)) {
    return error;
  }

  return {
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "AI engine failed.",
    retryable: false,
    fallback: fallbackForError("UNKNOWN"),
    cause: error,
  };
}

function isAIEngineError(error: unknown): error is AIEngineError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    "retryable" in error &&
    "fallback" in error,
  );
}
