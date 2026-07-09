import { z } from "zod";

const requiredText = z.string().trim().min(1, "This field is required.");

export const plannerInputSchema = z
  .object({
    destination: requiredText.max(80, "Destination is too long."),
    days: z
      .number()
      .int()
      .min(1, "Trip must be at least 1 day.")
      .max(30, "Trip can be up to 30 days."),
    budget: z
      .number()
      .min(1, "Budget must be greater than 0.")
      .max(1_000_000, "Budget is too high."),
    currency: z.enum(["USD", "HKD", "CNY", "JPY", "EUR", "GBP"]),
    travelStyle: z.enum(["first-time", "local", "classic", "balanced", "slow", "packed"]),
    companion: z.enum(["solo", "couple", "friends", "family", "group"]),
    interests: z
      .array(z.string())
      .min(1, "Choose at least one interest.")
      .max(8, "Choose up to 8 interests."),
    foodPreference: z.enum([
      "no-preference",
      "local-food",
      "fine-dining",
      "cafes",
      "vegetarian",
      "halal",
    ]),
    transportation: z.enum(["public-transit", "walking", "taxi", "rental-car", "mixed"]),
    accommodation: z.enum(["not-booked", "hotel-booked", "area-known", "need-suggestion"]),
    pace: z.enum(["relaxed", "balanced", "packed"]),
    travelGoal: z.enum([
      "first-visit",
      "food",
      "culture",
      "shopping",
      "photo",
      "relax",
      "adventure",
    ]),
    specialRequirement: z
      .string()
      .trim()
      .max(600, "Keep requirements under 600 characters.")
      .optional(),
    language: z.enum([
      "english",
      "chinese",
      "japanese",
      "korean",
      "local-language",
      "no-preference",
    ]),
    accessibility: z.enum(["none", "low-walking", "wheelchair", "stroller", "senior-friendly"]),
    visa: z.enum(["not-sure", "not-needed", "need-check", "already-have"]),
    hasFlights: z.boolean(),
    hasHotel: z.boolean(),
    mustVisitPlaces: z
      .string()
      .trim()
      .max(400, "Keep must-visit places under 400 characters.")
      .optional(),
    avoidPlaces: z.string().trim().max(400, "Keep avoid places under 400 characters.").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.days <= 2 && value.interests.length > 5) {
      ctx.addIssue({
        code: "custom",
        path: ["interests"],
        message: "For a short trip, choose fewer interests so the AI can prioritize well.",
      });
    }

    if (value.budget < value.days * 30 && value.currency !== "JPY") {
      ctx.addIssue({
        code: "custom",
        path: ["budget"],
        message: "Budget may be too low for a realistic independent trip.",
      });
    }
  });

export type PlannerInput = z.infer<typeof plannerInputSchema>;

export const defaultPlannerInput: PlannerInput = {
  destination: "",
  days: 4,
  budget: 1200,
  currency: "USD",
  travelStyle: "first-time",
  companion: "couple",
  interests: ["food", "culture"],
  foodPreference: "local-food",
  transportation: "public-transit",
  accommodation: "not-booked",
  pace: "balanced",
  travelGoal: "first-visit",
  specialRequirement: "",
  language: "english",
  accessibility: "none",
  visa: "not-sure",
  hasFlights: false,
  hasHotel: false,
  mustVisitPlaces: "",
  avoidPlaces: "",
};
