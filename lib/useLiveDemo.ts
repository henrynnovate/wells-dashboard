import { useCallback, useEffect, useRef } from "react";
import { buildWellSummaries, type WellSummary } from "@/lib/well-summary";

// Store original values so we can simulate from realistic baselines
const originalWellValues = new Map<number, Partial<WellSummary>>();

/**
 * Simulates realistic well metric fluctuations for demo purposes
 * Metrics change by ±5-15% randomly to mimic real production variations
 */
export function useLiveDemo(
  wells: WellSummary[],
  enabled: boolean,
  onUpdate: (wells: WellSummary[]) => void,
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Store original values on first load
  useEffect(() => {
    if (wells.length > 0 && originalWellValues.size === 0) {
      wells.forEach((well) => {
        originalWellValues.set(well.id, {
          liquid_production: well.liquid_production,
          oil_production: well.oil_production,
          gas_production: well.gas_production,
          gas_to_oil_ratio: well.gas_to_oil_ratio,
          basic_sediment_water: well.basic_sediment_water,
          downhole_pressure: well.downhole_pressure,
          sand_production: well.sand_production,
          jumper_pressure: well.jumper_pressure,
        });
      });
    }
  }, [wells.length]);

  const simulateUpdate = useCallback(() => {
    const updated = wells.map((well) => {
      const original = originalWellValues.get(well.id);
      if (!original) return well;

      const variances = {
        liquid_production: original.liquid_production
          ? original.liquid_production * (0.9 + Math.random() * 0.2)
          : 0,
        oil_production: original.oil_production
          ? original.oil_production * (0.85 + Math.random() * 0.3)
          : 0,
        gas_production: original.gas_production
          ? original.gas_production * (0.88 + Math.random() * 0.24)
          : 0,
        gas_to_oil_ratio: original.gas_to_oil_ratio
          ? original.gas_to_oil_ratio * (0.92 + Math.random() * 0.16)
          : 0,
        basic_sediment_water: original.basic_sediment_water
          ? original.basic_sediment_water * (0.8 + Math.random() * 0.4)
          : 0,
        downhole_pressure: original.downhole_pressure
          ? original.downhole_pressure * (0.95 + Math.random() * 0.1)
          : 0,
        sand_production: original.sand_production
          ? original.sand_production * (0.85 + Math.random() * 0.3)
          : 0,
        jumper_pressure: original.jumper_pressure
          ? original.jumper_pressure * (0.93 + Math.random() * 0.14)
          : 0,
      };

      return {
        ...well,
        ...variances,
        // Colors will be recalculated by buildWellSummaries
      } as unknown as WellSummary;
    });

    // Rebuild summaries to recalculate color status
    const processed = buildWellSummaries(
      updated.map((w) => ({
        id: w.id,
        liquid_production: w.liquid_production,
        oil_production: w.oil_production,
        gas_production: w.gas_production,
        gas_to_oil_ratio: w.gas_to_oil_ratio,
        basic_sediment_water: w.basic_sediment_water,
        downhole_pressure: w.downhole_pressure,
        sand_production: w.sand_production,
        jumper_pressure: w.jumper_pressure,
      })),
    );

    onUpdate(processed);
  }, [wells, onUpdate]);

  useEffect(() => {
    if (!enabled || wells.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Simulate updates every 2-3.5 seconds
    intervalRef.current = setInterval(() => {
      simulateUpdate();
    }, 2000 + Math.random() * 1500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, wells.length, simulateUpdate]);
}
