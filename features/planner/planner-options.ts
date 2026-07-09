export const popularDestinations = ["Tokyo", "Seoul", "Osaka", "Bangkok", "Singapore", "Paris"];

export const interestOptions = [
  { value: "food", label: "Food" },
  { value: "culture", label: "Culture" },
  { value: "shopping", label: "Shopping" },
  { value: "local-neighborhoods", label: "Local areas" },
  { value: "museums", label: "Museums" },
  { value: "nature", label: "Nature" },
  { value: "nightlife", label: "Nightlife" },
  { value: "coffee", label: "Coffee" },
  { value: "photo-spots", label: "Photo spots" },
  { value: "family-friendly", label: "Family friendly" },
];

export const travelTemplates = [
  {
    label: "First time in Tokyo",
    destination: "Tokyo",
    days: 4,
    budget: 1200,
    currency: "USD",
    interests: ["food", "culture", "shopping", "local-neighborhoods"],
  },
  {
    label: "Relaxed Seoul food trip",
    destination: "Seoul",
    days: 3,
    budget: 900,
    currency: "USD",
    interests: ["food", "coffee", "shopping"],
  },
  {
    label: "Classic Paris starter",
    destination: "Paris",
    days: 5,
    budget: 1800,
    currency: "EUR",
    interests: ["culture", "museums", "food", "photo-spots"],
  },
] as const;

export const budgetSuggestions = [
  { label: "Lean", value: 700 },
  { label: "Balanced", value: 1200 },
  { label: "Comfort", value: 2200 },
] as const;
