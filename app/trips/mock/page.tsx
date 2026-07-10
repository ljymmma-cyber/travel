import { TimelineShell } from "@/features/timeline/components/timeline-shell";
import { createDemoTravelPlan } from "@/features/timeline/lib/demo-plan";

type MockTripTimelinePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MockTripTimelinePage({ searchParams }: MockTripTimelinePageProps) {
  const params = await searchParams;
  const plan = createDemoTravelPlan(params);

  return <TimelineShell plan={plan} />;
}
