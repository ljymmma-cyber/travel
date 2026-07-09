import { Brain, ShieldCheck } from "lucide-react";

import type { Activity } from "@/features/ai/schemas/travel-plan.schema";

export function ExplainCard({ activity }: { activity: Activity }) {
  return (
    <div className="bg-muted/40 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Brain className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">AI recommendation</p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">{activity.reason}</p>
          </div>
          {activity.restaurant ? (
            <p className="text-muted-foreground text-sm leading-6">
              Restaurant fit: {activity.restaurant.routeFitReason}
            </p>
          ) : null}
          {activity.warnings.length > 0 ? (
            <div className="space-y-2">
              {activity.warnings.map((warning) => (
                <p
                  key={warning.code}
                  className="text-muted-foreground flex gap-2 text-sm leading-6"
                >
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {warning.message}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
