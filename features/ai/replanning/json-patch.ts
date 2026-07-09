import { travelPlanSchema, type TravelPlan } from "../schemas/travel-plan.schema";
import type { JsonPatchOperation } from "../schemas/replanning.schema";

export type PatchApplyResult =
  { ok: true; plan: TravelPlan } | { ok: false; error: string; failedPath?: string };

export function applyTravelPlanPatch(
  plan: TravelPlan,
  patches: JsonPatchOperation[],
): PatchApplyResult {
  const draft = structuredClone(plan) as unknown;

  for (const patch of patches) {
    const result = applyOperation(draft, patch);

    if (!result.ok) {
      return result;
    }
  }

  const validation = travelPlanSchema.safeParse(draft);

  if (!validation.success) {
    return {
      ok: false,
      error:
        validation.error.issues[0]?.message ?? "Patched plan does not match TravelPlan schema.",
    };
  }

  return { ok: true, plan: validation.data };
}

function applyOperation(target: unknown, patch: JsonPatchOperation): PatchApplyResult {
  if (patch.op === "move") {
    const valueResult = readPointer(target, patch.from);

    if (!valueResult.ok) {
      return { ok: false, error: valueResult.error, failedPath: patch.from };
    }

    const removeResult = removePointer(target, patch.from);

    if (!removeResult.ok) {
      return removeResult;
    }

    return addPointer(target, patch.path, valueResult.value);
  }

  if (patch.op === "add") {
    return addPointer(target, patch.path, patch.value);
  }

  if (patch.op === "remove") {
    return removePointer(target, patch.path);
  }

  return replacePointer(target, patch.path, patch.value);
}

function readPointer(
  target: unknown,
  pointer: string,
): { ok: true; value: unknown } | { ok: false; error: string } {
  const parent = getParent(target, pointer);

  if (!parent.ok) {
    return parent;
  }

  const { container, key } = parent;

  if (Array.isArray(container)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index >= container.length) {
      return { ok: false, error: `Invalid array index at ${pointer}.` };
    }

    return { ok: true, value: structuredClone(container[index]) };
  }

  if (isRecord(container) && key in container) {
    return { ok: true, value: structuredClone(container[key]) };
  }

  return { ok: false, error: `Path does not exist: ${pointer}.` };
}

function addPointer(target: unknown, pointer: string, value: unknown): PatchApplyResult {
  const parent = getParent(target, pointer);

  if (!parent.ok) {
    return { ok: false, error: parent.error, failedPath: pointer };
  }

  const { container, key } = parent;

  if (Array.isArray(container)) {
    if (key === "-") {
      container.push(value);
      return validatePartialSuccess();
    }

    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index > container.length) {
      return { ok: false, error: `Invalid add index at ${pointer}.`, failedPath: pointer };
    }

    container.splice(index, 0, value);
    return validatePartialSuccess();
  }

  if (isRecord(container)) {
    container[key] = value;
    return validatePartialSuccess();
  }

  return { ok: false, error: `Cannot add into non-container at ${pointer}.`, failedPath: pointer };
}

function replacePointer(target: unknown, pointer: string, value: unknown): PatchApplyResult {
  const parent = getParent(target, pointer);

  if (!parent.ok) {
    return { ok: false, error: parent.error, failedPath: pointer };
  }

  const { container, key } = parent;

  if (Array.isArray(container)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index >= container.length) {
      return { ok: false, error: `Invalid replace index at ${pointer}.`, failedPath: pointer };
    }

    container[index] = value;
    return validatePartialSuccess();
  }

  if (isRecord(container) && key in container) {
    container[key] = value;
    return validatePartialSuccess();
  }

  return { ok: false, error: `Cannot replace missing path ${pointer}.`, failedPath: pointer };
}

function removePointer(target: unknown, pointer: string): PatchApplyResult {
  const parent = getParent(target, pointer);

  if (!parent.ok) {
    return { ok: false, error: parent.error, failedPath: pointer };
  }

  const { container, key } = parent;

  if (Array.isArray(container)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index >= container.length) {
      return { ok: false, error: `Invalid remove index at ${pointer}.`, failedPath: pointer };
    }

    container.splice(index, 1);
    return validatePartialSuccess();
  }

  if (isRecord(container) && key in container) {
    delete container[key];
    return validatePartialSuccess();
  }

  return { ok: false, error: `Cannot remove missing path ${pointer}.`, failedPath: pointer };
}

function getParent(
  target: unknown,
  pointer: string,
):
  | { ok: true; container: unknown[] | Record<string, unknown>; key: string }
  | { ok: false; error: string } {
  const parts = parsePointer(pointer);

  if (!parts.ok) {
    return parts;
  }

  if (parts.value.length === 0) {
    return { ok: false, error: "Root replacement is not allowed for partial replanning." };
  }

  let current = target;

  for (const part of parts.value.slice(0, -1)) {
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return { ok: false, error: `Invalid array segment: ${part}.` };
      }
      current = current[index];
      continue;
    }

    if (isRecord(current) && part in current) {
      current = current[part];
      continue;
    }

    return { ok: false, error: `Path segment does not exist: ${part}.` };
  }

  if (!Array.isArray(current) && !isRecord(current)) {
    return { ok: false, error: "Parent path is not a container." };
  }

  return { ok: true, container: current, key: parts.value.at(-1) ?? "" };
}

function parsePointer(
  pointer: string,
): { ok: true; value: string[] } | { ok: false; error: string } {
  if (!pointer.startsWith("/")) {
    return { ok: false, error: `JSON Patch path must start with /: ${pointer}.` };
  }

  return {
    ok: true,
    value: pointer
      .slice(1)
      .split("/")
      .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~")),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validatePartialSuccess(): PatchApplyResult {
  return { ok: true, plan: {} as TravelPlan };
}
