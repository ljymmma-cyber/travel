import { MapPinned, Navigation, Train } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

export function MapPreview({ plan }: { plan: TravelPlan }) {
  const areas = Array.from(new Set(plan.days.flatMap((day) => day.areaFocus))).slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPinned className="h-4 w-4" aria-hidden="true" />
          Map preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-[linear-gradient(135deg,hsl(var(--muted)),hsl(var(--background)))]"
          aria-label="Mock map preview"
          role="img"
        >
          <div className="absolute inset-0 [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:34px_34px] opacity-70" />
          {plan.days.slice(0, 4).map((day, index) => (
            <div
              key={day.id}
              className="bg-primary text-primary-foreground absolute flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shadow-sm"
              style={{
                left: `${18 + index * 18}%`,
                top: `${22 + (index % 2) * 32}%`,
              }}
            >
              {day.dayIndex}
            </div>
          ))}
          <div className="bg-background/90 absolute right-3 bottom-3 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
            Mapbox reserved
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <Badge key={area} variant="outline">
              {area}
            </Badge>
          ))}
        </div>

        <div className="grid gap-2 text-sm">
          <p className="text-muted-foreground flex items-center gap-2">
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Route is grouped by nearby areas to reduce backtracking.
          </p>
          <p className="text-muted-foreground flex items-center gap-2">
            <Train className="h-4 w-4" aria-hidden="true" />
            Live transit and map APIs will connect in a later sprint.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
