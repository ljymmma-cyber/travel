import { TimelineShell } from "@/features/timeline/components/timeline-shell";
import { mockTravelPlan } from "@/features/timeline/data/mock-travel-plan";

export default function MockTripTimelinePage() {
  return <TimelineShell plan={mockTravelPlan} />;
}
