"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/services/supabase/server";
import { serverEnv } from "@/lib/env/server";
import {
  tripVersionSchema,
  workspaceTripSchema,
  type TripVersion,
  type WorkspaceTrip,
} from "@/features/workspace/schemas/workspace.schema";

type TripRow = {
  id: string;
  user_id: string | null;
  title: string;
  destination: string;
  cover_gradient: string;
  status: WorkspaceTrip["status"];
  tags: string[];
  is_favorite: boolean;
  start_date: string | null;
  end_date: string | null;
  updated_at: string;
  created_at: string;
  budget_min: number;
  budget_max: number;
  currency: WorkspaceTrip["currency"];
  current_plan: unknown;
};

type VersionRow = {
  id: string;
  trip_id: string;
  version_number: number;
  label: string;
  created_at: string;
  created_by: TripVersion["createdBy"];
  summary: string;
  plan_snapshot: unknown;
};

export async function listTripsAction(): Promise<WorkspaceTrip[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapTripRow(row as TripRow));
}

export async function getTripAction(tripId: string): Promise<WorkspaceTrip | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();

  if (error || !data) {
    return null;
  }

  return mapTripRow(data as TripRow);
}

export async function listTripVersionsAction(tripId: string): Promise<TripVersion[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("trip_versions")
    .select("*")
    .eq("trip_id", tripId)
    .order("version_number", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapVersionRow(row as VersionRow));
}

export async function autosaveTripAction(trip: WorkspaceTrip) {
  if (!isSupabaseConfigured()) {
    return { ok: false, mode: "local", message: "Supabase is not configured; saved locally." };
  }

  const parsedTrip = workspaceTripSchema.parse(trip);
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { ok: false, mode: "anonymous", message: "Sign in to sync trips across devices." };
  }

  const { error } = await supabase.from("trips").upsert({
    id: parsedTrip.id,
    user_id: userData.user.id,
    title: parsedTrip.title,
    destination: parsedTrip.destination,
    cover_gradient: parsedTrip.coverGradient,
    status: parsedTrip.status,
    tags: parsedTrip.tags,
    is_favorite: parsedTrip.isFavorite,
    start_date: parsedTrip.startDate,
    end_date: parsedTrip.endDate,
    budget_min: parsedTrip.budgetMin,
    budget_max: parsedTrip.budgetMax,
    currency: parsedTrip.currency,
    current_plan: parsedTrip.plan,
    updated_at: parsedTrip.updatedAt,
  });

  revalidatePath("/workspace");
  revalidatePath(`/workspace/${parsedTrip.id}`);

  return {
    ok: !error,
    mode: "supabase",
    message: error?.message ?? "Saved",
  };
}

function isSupabaseConfigured() {
  return Boolean(serverEnv.NEXT_PUBLIC_SUPABASE_URL && serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function mapTripRow(row: TripRow): WorkspaceTrip {
  return workspaceTripSchema.parse({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    destination: row.destination,
    coverGradient: row.cover_gradient,
    status: row.status,
    tags: row.tags ?? [],
    isFavorite: row.is_favorite,
    startDate: row.start_date,
    endDate: row.end_date,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    budgetMin: Number(row.budget_min),
    budgetMax: Number(row.budget_max),
    currency: row.currency,
    versionCount: 1,
    plan: row.current_plan,
  });
}

function mapVersionRow(row: VersionRow): TripVersion {
  return tripVersionSchema.parse({
    id: row.id,
    tripId: row.trip_id,
    versionNumber: row.version_number,
    label: row.label,
    createdAt: row.created_at,
    createdBy: row.created_by,
    summary: row.summary,
    plan: row.plan_snapshot,
  });
}
