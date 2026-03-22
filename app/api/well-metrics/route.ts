import { NextResponse } from "next/server";
import { logServerError } from "@/lib/telemetry";
import { getWellRows } from "@/lib/well-data";

interface WellMetric {
  id: number;
  date?: string;
  liquid_production: number;
  oil_production: number;
  gas_production: number;
  gas_to_oil_ratio: number;
  basic_sediment_water: number;
  downhole_pressure: number;
  sand_production: number;
  jumper_pressure: number;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wellId = url.searchParams.get("wellId");

  if (!wellId) {
    return NextResponse.json({ error: "Missing wellId parameter" }, { status: 400 });
  }

  try {
    const wellData = await getWellRows();
    const selectedWellMetrics: WellMetric[] = wellData.filter(
      (well) => well.id === Number(wellId),
    );

    if (selectedWellMetrics.length === 0) {
      return NextResponse.json(
        { error: "No data found for the specified wellId" },
        { status: 404 },
      );
    }

    return NextResponse.json(selectedWellMetrics, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    logServerError("api.well-metrics", error, { wellId });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
