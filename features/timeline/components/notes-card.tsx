import { CheckCircle2, Lightbulb, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

export function NotesCard({ plan }: { plan: TravelPlan }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {plan.explain.tradeoffs.slice(0, 3).map((tradeoff) => (
            <p key={tradeoff} className="text-muted-foreground flex gap-2 text-sm leading-6">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {tradeoff}
            </p>
          ))}
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium">Modify this plan</p>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Sprint 4 will connect this to local AI modification: change one day without rewriting
            the whole trip.
          </p>
          <Button className="mt-3 w-full" size="sm">
            <PencilLine aria-hidden="true" />
            Modify with AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
