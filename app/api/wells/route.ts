import { NextResponse } from "next/server";
import { logServerError } from "@/lib/telemetry";
import { getWellRows } from "@/lib/well-data";
import { buildWellSummaries } from "@/lib/well-summary";

export async function GET() {
  try {
    const wells = await getWellRows();
    const processedWells = buildWellSummaries(wells);

    return NextResponse.json(processedWells, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    logServerError("api.wells", error);
    return NextResponse.json({ error: "Failed to fetch wells data" }, { status: 500 });
  }
}
