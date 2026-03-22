import WellsDashboardView from "@/components/WellsDashboardView";
import { getInitialWellSummaries } from "@/lib/dashboard-initial-data";

const METRICS = [
  {
    label: "LPE%",
    key: "lpeColor" as const,
  },
  {
    label: "OPE%",
    key: "opeColor" as const,
  },
  {
    label: "GPE%",
    key: "gpeColor" as const,
  },
];

export default async function ProductionKPI() {
  const { initialWells, initialError } = await getInitialWellSummaries("production-kpi");

  return (
    <WellsDashboardView
      title="Production KPI View"
      metrics={METRICS}
      initialWells={initialWells}
      initialError={initialError}
      nextHref="/well-health"
    />
  );
}
