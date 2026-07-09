import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  OPENAI_API_KEY: z.string().default(""),
  MAPBOX_SECRET_KEY: z.string().default(""),
  GOOGLE_MAPS_API_KEY: z.string().default(""),
  SENTRY_DSN: z.string().default(""),
  RATE_LIMIT_SECRET: z.string().default(""),
});

export const serverEnv = serverEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MAPBOX_SECRET_KEY: process.env.MAPBOX_SECRET_KEY,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  RATE_LIMIT_SECRET: process.env.RATE_LIMIT_SECRET,
});
