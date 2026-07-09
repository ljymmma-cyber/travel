import OpenAI from "openai";
import { describe, expect, it } from "vitest";

import {
  createAIEngineError,
  fallbackForError,
  OpenAIPlanningClient,
} from "@/features/ai/client/openai-planning-client";

describe("OpenAIPlanningClient", () => {
  it("maps OpenAI chat completion output into model response", async () => {
    const fakeOpenAI = {
      chat: {
        completions: {
          create: async () => ({
            model: "test-model",
            choices: [{ message: { content: '{"ok":true}' } }],
            usage: { prompt_tokens: 10, completion_tokens: 5 },
          }),
        },
      },
    } as unknown as OpenAI;

    const client = new OpenAIPlanningClient(fakeOpenAI);
    const result = await client.requestJson({
      messages: [{ role: "user", content: "Return JSON" }],
    });

    expect(result.rawText).toBe('{"ok":true}');
    expect(result.inputTokens).toBe(10);
    expect(result.outputTokens).toBe(5);
  });

  it("classifies network-like failures", () => {
    const error = createAIEngineError(new TypeError("fetch failed"));

    expect(error.code).toBe("NETWORK_ERROR");
    expect(error.retryable).toBe(true);
  });

  it("provides fallback guidance for known errors", () => {
    expect(fallbackForError("TIMEOUT")).toContain("retry");
  });
});
