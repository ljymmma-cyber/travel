import { createOpenAI } from "@ai-sdk/openai";

import { assertConfigured } from "@/lib/env/assert";
import { serverEnv } from "@/lib/env/server";

export function createOpenAIProvider() {
  return createOpenAI({
    apiKey: assertConfigured(serverEnv.OPENAI_API_KEY, "OPENAI_API_KEY"),
  });
}
