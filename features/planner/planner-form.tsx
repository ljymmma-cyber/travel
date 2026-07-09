"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  defaultPlannerInput,
  plannerInputSchema,
  type PlannerInput,
} from "@/schemas/planner.schema";

import {
  budgetSuggestions,
  interestOptions,
  popularDestinations,
  travelTemplates,
} from "./planner-options";
import { getPlannerTips, type PlannerTip } from "./planner-tips";

const fieldLabelClass = "text-sm font-medium text-foreground";
const fieldHintClass = "text-muted-foreground text-xs leading-5";
const fieldErrorClass = "text-destructive text-xs leading-5";

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className={fieldLabelClass}>{label}</span>
      {children}
      {hint && !error ? <span className={fieldHintClass}>{hint}</span> : null}
      {error ? <span className={fieldErrorClass}>{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}) {
  return (
    <FormField label={label} hint={hint}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

function TipCard({ tip }: { tip: PlannerTip }) {
  const toneClass = {
    info: "border-info/30 bg-info/5 text-info",
    warning: "border-warning/40 bg-warning/10 text-warning-foreground",
    success: "border-success/30 bg-success/10 text-success",
  }[tip.tone];

  return (
    <div className={cn("rounded-lg border p-3", toneClass)}>
      <p className="text-sm font-medium">{tip.title}</p>
      <p className="mt-1 text-xs leading-5 opacity-85">{tip.description}</p>
    </div>
  );
}

function toggleTag(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function PlannerForm() {
  const [isThinking, setIsThinking] = React.useState(false);
  const [submittedValues, setSubmittedValues] = React.useState<PlannerInput | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<PlannerInput>({
    resolver: zodResolver(plannerInputSchema),
    defaultValues: defaultPlannerInput,
    mode: "onChange",
  });

  const values = useWatch({ control }) as PlannerInput;
  const tips = getPlannerTips({ ...defaultPlannerInput, ...values });

  function applyTemplate(template: (typeof travelTemplates)[number]) {
    reset({
      ...defaultPlannerInput,
      destination: template.destination,
      days: template.days,
      budget: template.budget,
      currency: template.currency,
      interests: [...template.interests],
    });
  }

  async function onSubmit(data: PlannerInput) {
    setSubmittedValues(data);
    setIsThinking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
  }

  if (isThinking) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid min-h-[520px] w-full max-w-3xl place-items-center px-6 py-16"
        aria-live="polite"
      >
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            </div>
            <CardTitle>Preparing your AI travel brief</CardTitle>
            <CardDescription>
              Sprint 1 validates your inputs and prepares the transition. Sprint 2 will connect the
              AI planning workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-sm">
              <p className="font-medium">{submittedValues?.destination || "Your destination"}</p>
              <p className="text-muted-foreground mt-1">
                {submittedValues?.days} days · {submittedValues?.currency} {submittedValues?.budget}{" "}
                · {submittedValues?.interests.length} interests
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsThinking(false)}
            >
              Back to planner
            </Button>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Trip basics</CardTitle>
            <CardDescription>
              Give the AI just enough structure to avoid vague prompts.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Destination"
              hint="Use a city or region, such as Tokyo or Kansai."
              error={errors.destination?.message}
            >
              <Input
                placeholder="Tokyo"
                autoComplete="address-level2"
                {...register("destination")}
              />
            </FormField>

            <FormField label="Days" hint="MVP supports 1 to 30 days." error={errors.days?.message}>
              <Input
                type="number"
                min={1}
                max={30}
                inputMode="numeric"
                {...register("days", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Budget"
              hint="Total trip budget excluding flights."
              error={errors.budget?.message}
            >
              <Input
                type="number"
                min={1}
                inputMode="decimal"
                {...register("budget", { valueAsNumber: true })}
              />
            </FormField>

            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <SelectField
                  label="Currency"
                  value={field.value}
                  onChange={field.onChange}
                  options={["USD", "HKD", "CNY", "JPY", "EUR", "GBP"].map((item) => ({
                    value: item,
                    label: item,
                  }))}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Travel preferences</CardTitle>
            <CardDescription>
              Structured choices help the AI plan without asking you to write prompts.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Controller
              control={control}
              name="travelStyle"
              render={({ field }) => (
                <SelectField
                  label="Travel style"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "first-time", label: "First-time essentials" },
                    { value: "local", label: "Local and hidden spots" },
                    { value: "classic", label: "Classic landmarks" },
                    { value: "balanced", label: "Balanced" },
                    { value: "slow", label: "Slow travel" },
                    { value: "packed", label: "Packed itinerary" },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="companion"
              render={({ field }) => (
                <SelectField
                  label="Companion"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "solo", label: "Solo" },
                    { value: "couple", label: "Couple" },
                    { value: "friends", label: "Friends" },
                    { value: "family", label: "Family" },
                    { value: "group", label: "Group" },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="pace"
              render={({ field }) => (
                <SelectField
                  label="Pace"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "relaxed", label: "Relaxed" },
                    { value: "balanced", label: "Balanced" },
                    { value: "packed", label: "Packed" },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="travelGoal"
              render={({ field }) => (
                <SelectField
                  label="Travel goal"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "first-visit", label: "First visit" },
                    { value: "food", label: "Food discovery" },
                    { value: "culture", label: "Culture" },
                    { value: "shopping", label: "Shopping" },
                    { value: "photo", label: "Photo spots" },
                    { value: "relax", label: "Relax" },
                    { value: "adventure", label: "Adventure" },
                  ]}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
            <CardDescription>
              Pick at least one. The AI will use these as planning constraints.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="interests"
              render={({ field }) => (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Interest tags">
                    {interestOptions.map((interest) => {
                      const selected = field.value.includes(interest.value);
                      return (
                        <button
                          key={interest.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => field.onChange(toggleTag(field.value, interest.value))}
                          className={cn(
                            "focus-visible:ring-ring rounded-full border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:bg-accent",
                          )}
                        >
                          {selected ? (
                            <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                          ) : null}
                          {interest.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.interests?.message ? (
                    <p className={fieldErrorClass}>{errors.interests.message}</p>
                  ) : null}
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip constraints</CardTitle>
            <CardDescription>
              These reduce AI guesswork and improve the next planning step.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Controller
              control={control}
              name="foodPreference"
              render={({ field }) => (
                <SelectField
                  label="Food preference"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "no-preference", label: "No preference" },
                    { value: "local-food", label: "Local food" },
                    { value: "fine-dining", label: "Fine dining" },
                    { value: "cafes", label: "Cafes" },
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "halal", label: "Halal" },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="transportation"
              render={({ field }) => (
                <SelectField
                  label="Transportation"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "public-transit", label: "Public transit" },
                    { value: "walking", label: "Mostly walking" },
                    { value: "taxi", label: "Taxi / ride-hailing" },
                    { value: "rental-car", label: "Rental car" },
                    { value: "mixed", label: "Mixed" },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="accommodation"
              render={({ field }) => (
                <SelectField
                  label="Accommodation"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "not-booked", label: "Not booked" },
                    { value: "hotel-booked", label: "Hotel booked" },
                    { value: "area-known", label: "I know the area" },
                    { value: "need-suggestion", label: "Need area suggestion" },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <SelectField
                  label="Language"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "english", label: "English" },
                    { value: "chinese", label: "Chinese" },
                    { value: "japanese", label: "Japanese" },
                    { value: "korean", label: "Korean" },
                    { value: "local-language", label: "Local language" },
                    { value: "no-preference", label: "No preference" },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="accessibility"
              render={({ field }) => (
                <SelectField
                  label="Accessibility"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "none", label: "No special needs" },
                    { value: "low-walking", label: "Less walking" },
                    { value: "wheelchair", label: "Wheelchair accessible" },
                    { value: "stroller", label: "Stroller friendly" },
                    { value: "senior-friendly", label: "Senior friendly" },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="visa"
              render={({ field }) => (
                <SelectField
                  label="Visa"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "not-sure", label: "Not sure" },
                    { value: "not-needed", label: "Not needed" },
                    { value: "need-check", label: "Need to check" },
                    { value: "already-have", label: "Already have" },
                  ]}
                />
              )}
            />

            <div className="grid gap-3 md:col-span-2">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="border-input h-4 w-4 rounded"
                  {...register("hasFlights")}
                />
                I already have flights
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="border-input h-4 w-4 rounded"
                  {...register("hasHotel")}
                />
                I already have a hotel
              </label>
            </div>

            <FormField label="Must-visit places" hint="Optional. Add places separated by commas.">
              <Textarea
                placeholder="Shibuya Sky, Senso-ji, Tsukiji..."
                {...register("mustVisitPlaces")}
              />
            </FormField>

            <FormField label="Places to avoid" hint="Optional. Tell the AI what not to include.">
              <Textarea
                placeholder="Theme parks, nightlife, long hikes..."
                {...register("avoidPlaces")}
              />
            </FormField>

            <FormField
              label="Special requirements"
              hint="Optional. Dietary needs, mobility, travel rhythm, reservation concerns..."
              error={errors.specialRequirement?.message}
            >
              <Textarea
                placeholder="I prefer a relaxed morning and want one cafe break each day."
                {...register("specialRequirement")}
              />
            </FormField>
          </CardContent>
        </Card>

        <div className="bg-background/90 sticky bottom-4 z-10 rounded-xl border p-3 shadow-lg backdrop-blur">
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles />
            )}
            Generate AI travel brief
            <ArrowRight />
          </Button>
        </div>
      </form>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Smart suggestions</CardTitle>
            <CardDescription>One-click inputs for common planning patterns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className={fieldLabelClass}>Popular destinations</p>
              <div className="flex flex-wrap gap-2">
                {popularDestinations.map((destination) => (
                  <Button
                    key={destination}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("destination", destination, { shouldValidate: true })}
                  >
                    {destination}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className={fieldLabelClass}>Budget presets</p>
              <div className="grid grid-cols-3 gap-2">
                {budgetSuggestions.map((budget) => (
                  <Button
                    key={budget.label}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setValue("budget", budget.value, { shouldValidate: true })}
                  >
                    {budget.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className={fieldLabelClass}>Trip templates</p>
              <div className="grid gap-2">
                {travelTemplates.map((template) => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="hover:bg-accent focus-visible:ring-ring rounded-lg border p-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="font-medium">{template.label}</span>
                    <span className="text-muted-foreground mt-1 block">
                      {template.days} days · {template.interests.length} interests
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI tips</CardTitle>
            <CardDescription>Live guidance before Sprint 2 connects generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tips.length > 0 ? (
              tips.map((tip) => <TipCard key={tip.id} tip={tip} />)
            ) : (
              <div className="rounded-lg border p-3">
                <Badge variant="secondary">Ready</Badge>
                <p className="mt-2 text-sm font-medium">Your inputs are structured enough.</p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  The next sprint will send this brief into the AI planning workflow.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
