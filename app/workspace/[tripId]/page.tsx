import { notFound } from "next/navigation";

import { getTripAction, listTripVersionsAction } from "@/actions/workspace.actions";
import { TripDetailClient } from "@/features/workspace/components/trip-detail-client";
import { mockTripVersions, mockWorkspaceTrips } from "@/features/workspace/data/mock-workspace";

export default async function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const savedTrip = await getTripAction(tripId);
  const mockTrip = mockWorkspaceTrips.find((trip) => trip.id === tripId);
  const trip = savedTrip ?? mockTrip;

  if (!trip) {
    notFound();
  }

  const savedVersions = await listTripVersionsAction(tripId);
  const versions =
    savedVersions.length > 0
      ? savedVersions
      : mockTripVersions.filter((version) => version.tripId === trip.id);

  return <TripDetailClient initialTrip={trip} initialVersions={versions} />;
}
