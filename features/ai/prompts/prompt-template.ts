import type {
  AIEngineLocale,
  AIEngineRole,
  AIEngineStyle,
  AIEngineTone,
} from "../types/engine.types";

export type PromptVariableValue =
  string | number | boolean | string[] | number[] | Record<string, unknown>;

export type PromptTemplate = {
  id: string;
  version: string;
  locale: AIEngineLocale;
  role: AIEngineRole;
  style: AIEngineStyle;
  tone: AIEngineTone;
  constraints: string[];
  variables: string[];
  template: string;
};

export type RenderedPromptPart = {
  id: string;
  role: AIEngineRole;
  content: string;
};

export type ModelMessage = {
  role: "system" | "user";
  content: string;
};

export function renderPromptPart(
  prompt: PromptTemplate,
  variables: Record<string, PromptVariableValue>,
): RenderedPromptPart {
  const content = prompt.template.replaceAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    if (!(key in variables)) {
      throw new Error(`Missing prompt variable: ${key}`);
    }

    return formatPromptVariable(variables[key]);
  });

  return {
    id: prompt.id,
    role: prompt.role,
    content: [content.trim(), formatConstraints(prompt.constraints)].filter(Boolean).join("\n\n"),
  };
}

export function buildModelMessages(parts: RenderedPromptPart[]): ModelMessage[] {
  return parts.map((part) => ({
    role: part.role === "user" ? "user" : "system",
    content: `[${part.role.toUpperCase()}]\n${part.content}`,
  }));
}

function formatPromptVariable(value: PromptVariableValue) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => `- ${item}`).join("\n") : "- None";
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatConstraints(constraints: string[]) {
  if (constraints.length === 0) {
    return "";
  }

  return `Constraints:\n${constraints.map((constraint) => `- ${constraint}`).join("\n")}`;
}
