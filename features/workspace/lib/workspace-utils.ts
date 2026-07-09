import type { TripFilters, TripVersion, WorkspaceTrip } from "../schemas/workspace.schema";

export function filterAndSortTrips(trips: WorkspaceTrip[], filters: TripFilters) {
  const query = filters.query.trim().toLowerCase();

  return trips
    .filter((trip) => {
      if (filters.status !== "all" && trip.status !== filters.status) {
        return false;
      }

      if (filters.favoriteOnly && !trip.isFavorite) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [trip.title, trip.destination, ...trip.tags].some((value) =>
        value.toLowerCase().includes(query),
      );
    })
    .toSorted((left, right) => {
      if (filters.sortBy === "updated_asc") {
        return left.updatedAt.localeCompare(right.updatedAt);
      }

      if (filters.sortBy === "destination") {
        return left.destination.localeCompare(right.destination);
      }

      if (filters.sortBy === "budget_desc") {
        return right.budgetMax - left.budgetMax;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
}

export function duplicateTrip(trip: WorkspaceTrip, now = new Date()): WorkspaceTrip {
  const timestamp = now.toISOString();

  return {
    ...trip,
    id: `${trip.id}_copy_${now.getTime()}`,
    title: `${trip.title} Copy`,
    isFavorite: false,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createVersionFromTrip(
  trip: WorkspaceTrip,
  versionNumber: number,
  summary: string,
  createdBy: TripVersion["createdBy"],
  now = new Date(),
): TripVersion {
  return {
    id: `${trip.id}_v${versionNumber}_${now.getTime()}`,
    tripId: trip.id,
    versionNumber,
    label: `Version ${versionNumber}`,
    createdAt: now.toISOString(),
    createdBy,
    summary,
    plan: trip.plan,
  };
}

export function restoreVersion(
  trip: WorkspaceTrip,
  version: TripVersion,
  now = new Date(),
): WorkspaceTrip {
  return {
    ...trip,
    plan: version.plan,
    title: version.plan.title,
    destination: version.plan.destination,
    budgetMin: version.plan.totalBudget.min,
    budgetMax: version.plan.totalBudget.max,
    currency: version.plan.totalBudget.currency,
    updatedAt: now.toISOString(),
    versionCount: Math.max(trip.versionCount, version.versionNumber),
  };
}

export function getAutosavePayload(trip: WorkspaceTrip) {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    status: trip.status,
    tags: trip.tags,
    isFavorite: trip.isFavorite,
    updatedAt: trip.updatedAt,
    plan: trip.plan,
  };
}
