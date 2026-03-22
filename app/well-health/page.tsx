import WellsDashboardView from "@/components/WellsDashboardView";
import { getInitialWellSummaries } from "@/lib/dashboard-initial-data";

const METRICS = [
  {
    label: "GOR%",
    key: "gorColor" as const,
  },
  {
    label: "BSW%",
    key: "waterRiskColor" as const,
  },
  {
    label: "DHP%",
    key: "pressureColor" as const,
  },
];

export default async function WellHealthView() {
  const { initialWells, initialError } = await getInitialWellSummaries("well-health");

  return (
    <WellsDashboardView
      title="Well Health View"
      metrics={METRICS}
      initialWells={initialWells}
      initialError={initialError}
      prevHref="/production-kpi"
      nextHref="/well-integrity"
    />
  );
}
