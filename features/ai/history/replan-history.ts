import type { TravelPlan } from "../schemas/travel-plan.schema";
import type { ReplanPatchResponse, ReplanRequest } from "../schemas/replanning.schema";
import type { TravelPlanDiff } from "../diff/travel-plan-diff";

export type ReplanHistoryEntry = {
  id: string;
  createdAt: string;
  request: ReplanRequest;
  before: TravelPlan;
  after: TravelPlan;
  patchResponse: ReplanPatchResponse;
  diff: TravelPlanDiff;
};

export type ReplanHistoryState = {
  past: ReplanHistoryEntry[];
  present: TravelPlan;
  future: ReplanHistoryEntry[];
};

export function createReplanHistory(initialPlan: TravelPlan): ReplanHistoryState {
  return {
    past: [],
    present: initialPlan,
    future: [],
  };
}

export function pushReplanHistory(
  state: ReplanHistoryState,
  entry: ReplanHistoryEntry,
): ReplanHistoryState {
  return {
    past: [...state.past, entry],
    present: entry.after,
    future: [],
  };
}

export function undoReplan(state: ReplanHistoryState): ReplanHistoryState {
  const entry = state.past.at(-1);

  if (!entry) {
    return state;
  }

  return {
    past: state.past.slice(0, -1),
    present: entry.before,
    future: [entry, ...state.future],
  };
}

export function redoReplan(state: ReplanHistoryState): ReplanHistoryState {
  const entry = state.future[0];

  if (!entry) {
    return state;
  }

  return {
    past: [...state.past, entry],
    present: entry.after,
    future: state.future.slice(1),
  };
}
