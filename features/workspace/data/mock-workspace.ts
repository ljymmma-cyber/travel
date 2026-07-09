import { mockTravelPlan } from "@/features/timeline/data/mock-travel-plan";

import type { TripVersion, WorkspaceTrip } from "../schemas/workspace.schema";

const now = "2026-07-10T00:00:00.000Z";

export const mockWorkspaceTrips: WorkspaceTrip[] = [
  {
    id: "trip_tokyo_workspace",
    userId: null,
    title: mockTravelPlan.title,
    destination: mockTravelPlan.destination,
    coverGradient: "from-sky-200 via-cyan-100 to-emerald-100",
    status: "planned",
    tags: ["first-time", "food", "culture"],
    isFavorite: true,
    startDate: "2026-09-12",
    endDate: "2026-09-15",
    updatedAt: now,
    createdAt: "2026-07-09T00:00:00.000Z",
    budgetMin: mockTravelPlan.totalBudget.min,
    budgetMax: mockTravelPlan.totalBudget.max,
    currency: mockTravelPlan.totalBudget.currency,
    versionCount: 3,
    plan: mockTravelPlan,
  },
  {
    id: "trip_seoul_workspace",
    userId: null,
    title: "Seoul Cafe, Culture and Shopping Plan",
    destination: "Seoul",
    coverGradient: "from-rose-100 via-orange-100 to-lime-100",
    status: "draft",
    tags: ["cafes", "shopping"],
    isFavorite: false,
    startDate: null,
    endDate: null,
    updatedAt: "2026-07-08T08:30:00.000Z",
    createdAt: "2026-07-08T08:30:00.000Z",
    budgetMin: 360,
    budgetMax: 620,
    currency: "USD",
    versionCount: 1,
    plan: {
      ...mockTravelPlan,
      id: "trip_seoul_mock",
      destination: "Seoul",
      title: "Seoul Cafe, Culture and Shopping Plan",
      summary: "A draft Seoul plan ready for personalization.",
    },
  },
];

export const mockTripVersions: TripVersion[] = [
  {
    id: "tokyo_v1",
    tripId: "trip_tokyo_workspace",
    versionNumber: 1,
    label: "Version 1",
    createdAt: "2026-07-09T00:00:00.000Z",
    createdBy: "ai_generate",
    summary: "Initial AI-generated Tokyo plan.",
    plan: mockTravelPlan,
  },
  {
    id: "tokyo_v2",
    tripId: "trip_tokyo_workspace",
    versionNumber: 2,
    label: "Version 2",
    createdAt: "2026-07-09T04:00:00.000Z",
    createdBy: "partial_replan",
    summary: "Adjusted Day 2 for more food and less walking.",
    plan: mockTravelPlan,
  },
  {
    id: "tokyo_v3",
    tripId: "trip_tokyo_workspace",
    versionNumber: 3,
    label: "Version 3",
    createdAt: now,
    createdBy: "manual_edit",
    summary: "Saved current workspace version.",
    plan: mockTravelPlan,
  },
];
