import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlannerForm } from "@/features/planner/planner-form";

export default function PlannerPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end lg:py-12">
          <div className="max-w-3xl space-y-5">
            <Badge variant="secondary" className="w-fit">
              <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              AI-native trip planning
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                Tell AI what matters. Get a travel plan it can actually use.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg leading-8">
                A structured planner for first-time independent travelers. No prompt writing, no
                blank page, no spreadsheet gymnastics.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#planner-form">
                  Start planning
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#smart-guidance">See smart guidance</a>
              </Button>
            </div>
          </div>

          <div
            id="smart-guidance"
            className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm"
          >
            <p className="text-sm font-medium">Less prompt, more guidance</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              The form converts travel intent into structured AI-ready constraints: destination,
              days, budget, interests, travel style, accessibility, and must-visit or avoid lists.
            </p>
          </div>
        </section>

        <section id="planner-form" aria-label="Travel planner form" className="pb-16">
          <PlannerForm />
        </section>
      </div>
    </main>
  );
}
