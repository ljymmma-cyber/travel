import type { DiffStatus } from "@/features/ai/diff/travel-plan-diff";

export type ActivityVisualStatus = DiffStatus | "locked" | "favorite";

export type ModifyPanelState = {
  open: boolean;
  targetDayId: string;
  targetActivityId?: string;
};
