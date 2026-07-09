"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Heart, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { TripFilters, WorkspaceTrip } from "../schemas/workspace.schema";
import { duplicateTrip, filterAndSortTrips } from "../lib/workspace-utils";

const storageKey = "ai-travel-planner:workspace-trips";

export function WorkspaceClient({ initialTrips }: { initialTrips: WorkspaceTrip[] }) {
  const [trips, setTrips] = useState(initialTrips);
  const [filters, setFilters] = useState<TripFilters>({
    query: "",
    status: "all",
    favoriteOnly: false,
    sortBy: "updated_desc",
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      setTrips(JSON.parse(stored) as WorkspaceTrip[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(trips));
  }, [trips]);

  const visibleTrips = useMemo(() => filterAndSortTrips(trips, filters), [trips, filters]);

  function toggleFavorite(tripId: string) {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId
          ? { ...trip, isFavorite: !trip.isFavorite, updatedAt: new Date().toISOString() }
          : trip,
      ),
    );
  }

  function deleteTrip(tripId: string) {
    setTrips((current) => current.filter((trip) => trip.id !== tripId));
  }

  function copyTrip(trip: WorkspaceTrip) {
    setTrips((current) => [duplicateTrip(trip), ...current]);
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="bg-card rounded-xl border p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Trips</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                Saved itineraries, local drafts, version history, and trips ready to continue
                editing.
              </p>
            </div>
            <Button asChild>
              <Link href="/">Create new plan</Link>
            </Button>
          </div>
        </header>

        <section className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_140px]">
            <label className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={filters.query}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                className="pl-9"
                placeholder="Search destination, tags, or title"
              />
            </label>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as TripFilters["status"],
                }))
              }
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">All status</option>
              <option value="draft">Draft</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sortBy: event.target.value as TripFilters["sortBy"],
                }))
              }
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            >
              <option value="updated_desc">Recently updated</option>
              <option value="updated_asc">Oldest updated</option>
              <option value="destination">Destination</option>
              <option value="budget_desc">Budget high</option>
            </select>
            <Button
              type="button"
              variant={filters.favoriteOnly ? "default" : "outline"}
              onClick={() =>
                setFilters((current) => ({ ...current, favoriteOnly: !current.favoriteOnly }))
              }
            >
              <Heart aria-hidden="true" />
              Favorites
            </Button>
          </div>
        </section>

        {visibleTrips.length === 0 ? (
          <WorkspaceEmptyState />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleTrips.map((trip) => (
              <article
                key={trip.id}
                className="bg-card overflow-hidden rounded-xl border shadow-sm"
              >
                <div className={`h-28 bg-gradient-to-br ${trip.coverGradient}`} />
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="line-clamp-2 text-lg font-semibold tracking-tight">
                        {trip.title}
                      </h2>
                      <p className="text-muted-foreground mt-1 text-sm">{trip.destination}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {trip.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground grid grid-cols-2 gap-2 text-sm">
                    <span>Updated {new Date(trip.updatedAt).toLocaleDateString()}</span>
                    <span>
                      {trip.currency} {trip.budgetMin}-{trip.budgetMax}
                    </span>
                    <span>{trip.versionCount} versions</span>
                    <span>{trip.startDate ?? "Dates TBD"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trip.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
                    <Button asChild size="sm">
                      <Link href={`/workspace/${trip.id}`}>Continue</Link>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label={trip.isFavorite ? "Unfavorite trip" : "Favorite trip"}
                      onClick={() => toggleFavorite(trip.id)}
                    >
                      <Heart aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label="Duplicate trip"
                      onClick={() => copyTrip(trip)}
                    >
                      <Copy aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label="Delete trip"
                      onClick={() => deleteTrip(trip.id)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function WorkspaceEmptyState() {
  return (
    <section className="bg-card rounded-xl border p-8 text-center shadow-sm">
      <p className="text-muted-foreground text-sm font-medium">No trips yet</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Start with one saved itinerary</h2>
      <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-6">
        Generate a plan, save it to your workspace, then continue editing without starting over.
      </p>
      <Button asChild className="mt-5">
        <Link href="/">Create trip</Link>
      </Button>
    </section>
  );
}
