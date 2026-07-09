import { NextResponse } from "next/server";

import { generateTravelPlan } from "@/features/ai/planner/planning-engine";
import { plannerInputSchema } from "@/schemas/planner.schema";

export const runtime = "edge";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedInput = plannerInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Planner input is invalid.",
          fields: parsedInput.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  const result = await generateTravelPlan(parsedInput.data);
  const status = result.ok ? 200 : mapErrorStatus(result.error.code);

  return NextResponse.json(result, { status });
}

function mapErrorStatus(code: string) {
  if (code === "RATE_LIMIT") {
    return 429;
  }

  if (code === "TIMEOUT") {
    return 504;
  }

  if (code === "VALIDATION_ERROR" || code === "JSON_ERROR") {
    return 422;
  }

  return 500;
}
