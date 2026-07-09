import { CircleDollarSign, Utensils, Train, Ticket, Hotel, ShoppingBag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TravelPlan } from "@/features/ai/schemas/travel-plan.schema";

import { formatMoney, getBudgetBreakdown } from "../lib/timeline-utils";

export function BudgetCard({ plan }: { plan: TravelPlan }) {
  const budget = getBudgetBreakdown(plan);
  const categories = [
    { label: "Food", value: budget.food, icon: Utensils },
    { label: "Transport", value: budget.transport, icon: Train },
    { label: "Tickets", value: budget.tickets, icon: Ticket },
    { label: "Hotel", value: budget.hotel, icon: Hotel },
    { label: "Shopping", value: budget.shopping, icon: ShoppingBag },
  ];
  const spentRatio = Math.min(100, Math.round((budget.plannedMax / budget.tripBudgetMax) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
          Budget summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold">
                {formatMoney(budget.plannedMax, budget.currency)}
              </p>
              <p className="text-muted-foreground text-sm">planned max spend</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatMoney(budget.remaining, budget.currency)}</p>
              <p className="text-muted-foreground text-sm">remaining</p>
            </div>
          </div>
          <div className="bg-muted mt-4 h-3 overflow-hidden rounded-full">
            <div className="bg-primary h-full rounded-full" style={{ width: `${spentRatio}%` }} />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            {spentRatio}% of {formatMoney(budget.tripBudgetMax, budget.currency)} upper budget used
          </p>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <BudgetRow
              key={category.label}
              label={category.label}
              value={formatMoney(category.value, budget.currency)}
              icon={category.icon}
              ratio={budget.plannedMax > 0 ? (category.value / budget.plannedMax) * 100 : 0}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetRow({
  icon: Icon,
  label,
  value,
  ratio,
}: {
  icon: typeof Utensils;
  label: string;
  value: string;
  ratio: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">
          <Icon className="text-muted-foreground h-4 w-4" aria-hidden="true" />
          {label}
        </span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className="bg-foreground/70 h-full rounded-full"
          style={{ width: `${Math.min(100, ratio)}%` }}
        />
      </div>
    </div>
  );
}
