import { listTripsAction } from "@/actions/workspace.actions";
import { WorkspaceClient } from "@/features/workspace/components/workspace-client";
import { mockWorkspaceTrips } from "@/features/workspace/data/mock-workspace";

export default async function WorkspacePage() {
  const savedTrips = await listTripsAction();

  return <WorkspaceClient initialTrips={savedTrips.length > 0 ? savedTrips : mockWorkspaceTrips} />;
}
