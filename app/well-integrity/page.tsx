import WellsDashboardView from "@/components/WellsDashboardView";
import { getInitialWellSummaries } from "@/lib/dashboard-initial-data";

const METRICS = [
  {
    label: "Sand",
    key: "sandRiskColor" as const,
  },
  {
    label: "JMP",
    key: "chokeColor" as const,
  },
];

export default async function WellIntegrity() {
  const { initialWells, initialError } = await getInitialWellSummaries("well-integrity");

  return (
    <WellsDashboardView
      title="Well Integrity View"
      metrics={METRICS}
      initialWells={initialWells}
      initialError={initialError}
      prevHref="/well-health"
    />
  );
}
