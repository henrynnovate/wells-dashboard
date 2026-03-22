import { logServerError } from "@/lib/telemetry";
import { getWellRows } from "@/lib/well-data";
import { buildWellSummaries, type WellSummary } from "@/lib/well-summary";

interface InitialWellsResult {
  initialWells: WellSummary[];
  initialError: string | null;
}

export async function getInitialWellSummaries(scope: string): Promise<InitialWellsResult> {
  try {
    const rows = await getWellRows();
    return {
      initialWells: buildWellSummaries(rows),
      initialError: null,
    };
  } catch (error) {
    logServerError(`page.${scope}.initial-wells`, error);
    return {
      initialWells: [],
      initialError: "Could not load wells. Please try again.",
    };
  }
}