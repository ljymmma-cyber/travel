import { streamText, type LanguageModel } from "ai";

type StreamTextInput = {
  model: LanguageModel;
  system?: string;
  prompt: string;
};

export function createTextStream({ model, system, prompt }: StreamTextInput) {
  return streamText({
    model,
    system,
    prompt,
  });
}
