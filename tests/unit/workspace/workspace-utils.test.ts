import { describe, expect, it } from "vitest";

import { mockWorkspaceTrips } from "@/features/workspace/data/mock-workspace";
import {
  createVersionFromTrip,
  duplicateTrip,
  filterAndSortTrips,
  getAutosavePayload,
  restoreVersion,
} from "@/features/workspace/lib/workspace-utils";

describe("workspace utils", () => {
  it("filters trips by query", () => {
    const result = filterAndSortTrips(mockWorkspaceTrips, {
      query: "tokyo",
      status: "all",
      favoriteOnly: false,
      sortBy: "updated_desc",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.destination).toBe("Tokyo");
  });

  it("filters by status", () => {
    const result = filterAndSortTrips(mockWorkspaceTrips, {
      query: "",
      status: "draft",
      favoriteOnly: false,
      sortBy: "updated_desc",
    });

    expect(result.every((trip) => trip.status === "draft")).toBe(true);
  });

  it("filters favorites", () => {
    const result = filterAndSortTrips(mockWorkspaceTrips, {
      query: "",
      status: "all",
      favoriteOnly: true,
      sortBy: "updated_desc",
    });

    expect(result.every((trip) => trip.isFavorite)).toBe(true);
  });

  it("sorts by destination", () => {
    const result = filterAndSortTrips(mockWorkspaceTrips, {
      query: "",
      status: "all",
      favoriteOnly: false,
      sortBy: "destination",
    });

    expect(result.map((trip) => trip.destination)).toEqual(["Seoul", "Tokyo"]);
  });

  it("duplicates a trip as draft", () => {
    const copy = duplicateTrip(mockWorkspaceTrips[0]!, new Date("2026-07-10T00:00:00.000Z"));

    expect(copy.id).not.toBe(mockWorkspaceTrips[0]?.id);
    expect(copy.status).toBe("draft");
    expect(copy.isFavorite).toBe(false);
  });

  it("creates version snapshots", () => {
    const version = createVersionFromTrip(
      mockWorkspaceTrips[0]!,
      4,
      "Manual save.",
      "manual_edit",
      new Date("2026-07-10T00:00:00.000Z"),
    );

    expect(version.versionNumber).toBe(4);
    expect(version.plan.id).toBe(mockWorkspaceTrips[0]?.plan.id);
  });

  it("restores a version into a trip", () => {
    const version = createVersionFromTrip(
      mockWorkspaceTrips[0]!,
      4,
      "Manual save.",
      "manual_edit",
      new Date("2026-07-10T00:00:00.000Z"),
    );
    const restored = restoreVersion(
      mockWorkspaceTrips[1]!,
      version,
      new Date("2026-07-10T00:00:00.000Z"),
    );

    expect(restored.plan.id).toBe(version.plan.id);
    expect(restored.destination).toBe(version.plan.destination);
  });

  it("builds autosave payload", () => {
    const payload = getAutosavePayload(mockWorkspaceTrips[0]!);

    expect(payload.id).toBe(mockWorkspaceTrips[0]?.id);
    expect(payload.plan.destination).toBe("Tokyo");
  });
});
