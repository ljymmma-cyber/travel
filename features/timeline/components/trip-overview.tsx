import { AlertTriangle, Hotel, MapPinned, Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

export function TripOverview({ plan }: { plan: TravelPlan }) {
  return (
    <section aria-label="Trip overview" className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Route className="h-4 w-4" aria-hidden="true" />
            Route logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {plan.explain.routeLogic.slice(0, 3).map((item) => (
            <p key={item} className="text-muted-foreground text-sm leading-6">
              {item}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Hotel className="h-4 w-4" aria-hidden="true" />
            Stay area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium">{plan.hotelRecommendation?.area ?? "Not specified"}</p>
          <p className="text-muted-foreground text-sm leading-6">
            {plan.hotelRecommendation?.fitReason ?? "AI will recommend a stay area later."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPinned className="h-4 w-4" aria-hidden="true" />
            Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {plan.explain.verificationNeeded.slice(0, 3).map((item) => (
            <Badge key={item} variant="outline" className="mr-2 mb-2">
              {item}
            </Badge>
          ))}
          {plan.warnings.length > 0 ? (
            <p className="text-muted-foreground flex gap-2 text-sm leading-6">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {plan.warnings[0]?.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
