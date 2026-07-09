"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen">
      <ErrorState
        title="The app hit an unexpected error"
        description="Your work is safe. Try refreshing this part of the app."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </main>
  );
}
