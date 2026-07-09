import { LoadingState } from "@/components/feedback/loading-state";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <LoadingState title="Loading workspace" description="Preparing the app foundation." />
    </main>
  );
}
