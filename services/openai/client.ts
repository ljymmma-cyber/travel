import OpenAI from "openai";

import { assertConfigured } from "@/lib/env/assert";
import { serverEnv } from "@/lib/env/server";

export function createOpenAIClient() {
  return new OpenAI({
    apiKey: assertConfigured(serverEnv.OPENAI_API_KEY, "OPENAI_API_KEY"),
  });
}
