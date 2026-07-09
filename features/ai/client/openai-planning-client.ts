import OpenAI from "openai";

import { assertConfigured } from "@/lib/env/assert";
import { serverEnv } from "@/lib/env/server";

import type {
  AIEngineError,
  AIEngineErrorCode,
  AIModelClient,
  AIModelRequest,
  AIModelResponse,
} from "../types/engine.types";

const defaultPlannerModel = process.env.OPENAI_PLANNER_MODEL || "gpt-4.1-mini";
const defaultTimeoutMs = 45_000;

export class OpenAIPlanningClient implements AIModelClient {
  private readonly client: OpenAI;

  constructor(client?: OpenAI) {
    this.client =
      client ??
      new OpenAI({
        apiKey: assertConfigured(serverEnv.OPENAI_API_KEY, "OPENAI_API_KEY"),
      });
  }

  async requestJson(request: AIModelRequest): Promise<AIModelResponse> {
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs ?? defaultTimeoutMs);

    request.signal?.addEventListener("abort", () => controller.abort(), { once: true });

    try {
      const completion = await this.client.chat.completions.create(
        {
          model: request.model ?? defaultPlannerModel,
          temperature: request.temperature ?? 0.4,
          response_format: { type: "json_object" },
          messages: request.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        },
        { signal: controller.signal },
      );

      const rawText = completion.choices[0]?.message?.content ?? "";

      return {
        rawText,
        model: completion.model,
        inputTokens: completion.usage?.prompt_tokens ?? null,
        outputTokens: completion.usage?.completion_tokens ?? null,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    } catch (error) {
      throw createAIEngineError(error);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createAIEngineError(error: unknown): AIEngineError {
  const code = classifyOpenAIError(error);

  return {
    code,
    message: error instanceof Error ? error.message : "AI request failed.",
    retryable: code === "NETWORK_ERROR" || code === "RATE_LIMIT" || code === "TIMEOUT",
    fallback: fallbackForError(code),
    cause: error,
  };
}

function classifyOpenAIError(error: unknown): AIEngineErrorCode {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "TIMEOUT";
  }

  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      return "RATE_LIMIT";
    }

    if (error.status && error.status >= 500) {
      return "OPENAI_ERROR";
    }

    return "OPENAI_ERROR";
  }

  if (error instanceof TypeError) {
    return "NETWORK_ERROR";
  }

  return "UNKNOWN";
}

export function fallbackForError(code: AIEngineErrorCode) {
  switch (code) {
    case "RATE_LIMIT":
      return "Ask the user to retry after a short wait and preserve the current planner input.";
    case "TIMEOUT":
      return "Offer retry with a shorter trip scope or fewer interests.";
    case "JSON_ERROR":
    case "VALIDATION_ERROR":
      return "Run repair strategy before returning an error to the user.";
    case "PROMPT_INJECTION":
      return "Ignore unsafe user instructions and regenerate using product constraints.";
    case "HALLUCINATION_RISK":
      return "Mark uncertain items as unverified and ask for confirmation before execution.";
    default:
      return "Preserve user input and show a retry option.";
  }
}
