import { KPI_THRESHOLDS, getStatusColor } from "@/lib/constants";
import type { WellDataRow } from "@/lib/well-data";

export interface WellSummary {
  id: number;
  liquid_production: number;
  oil_production: number;
  gas_production: number;
  gas_to_oil_ratio: number;
  basic_sediment_water: number;
  downhole_pressure: number;
  sand_production: number;
  jumper_pressure: number;
  lpeColor: string;
  opeColor: string;
  gpeColor: string;
  gorColor: string;
  waterRiskColor: string;
  pressureColor: string;
  sandRiskColor: string;
  chokeColor: string;
}

export function buildWellSummaries(rows: WellDataRow[]): WellSummary[] {
  return rows.map((well) => ({
    id: well.id,
    liquid_production: well.liquid_production,
    oil_production: well.oil_production,
    gas_production: well.gas_production,
    gas_to_oil_ratio: well.gas_to_oil_ratio,
    basic_sediment_water: well.basic_sediment_water,
    downhole_pressure: well.downhole_pressure,
    sand_production: well.sand_production,
    jumper_pressure: well.jumper_pressure,
    lpeColor: getStatusColor(
      well.liquid_production,
      KPI_THRESHOLDS.liquid_production.good,
      KPI_THRESHOLDS.liquid_production.warning,
      KPI_THRESHOLDS.liquid_production.inverted,
    ),
    opeColor: getStatusColor(
      well.oil_production,
      KPI_THRESHOLDS.oil_production.good,
      KPI_THRESHOLDS.oil_production.warning,
      KPI_THRESHOLDS.oil_production.inverted,
    ),
    gpeColor: getStatusColor(
      well.gas_production,
      KPI_THRESHOLDS.gas_production.good,
      KPI_THRESHOLDS.gas_production.warning,
      KPI_THRESHOLDS.gas_production.inverted,
    ),
    gorColor: getStatusColor(
      well.gas_to_oil_ratio,
      KPI_THRESHOLDS.gas_to_oil_ratio.good,
      KPI_THRESHOLDS.gas_to_oil_ratio.warning,
      KPI_THRESHOLDS.gas_to_oil_ratio.inverted,
    ),
    waterRiskColor: getStatusColor(
      well.basic_sediment_water,
      KPI_THRESHOLDS.basic_sediment_water.good,
      KPI_THRESHOLDS.basic_sediment_water.warning,
      KPI_THRESHOLDS.basic_sediment_water.inverted,
    ),
    pressureColor: getStatusColor(
      well.downhole_pressure,
      KPI_THRESHOLDS.downhole_pressure.good,
      KPI_THRESHOLDS.downhole_pressure.warning,
      KPI_THRESHOLDS.downhole_pressure.inverted,
    ),
    sandRiskColor: getStatusColor(
      well.sand_production,
      KPI_THRESHOLDS.sand_production.good,
      KPI_THRESHOLDS.sand_production.warning,
      KPI_THRESHOLDS.sand_production.inverted,
    ),
    chokeColor: getStatusColor(
      well.jumper_pressure,
      KPI_THRESHOLDS.jumper_pressure.good,
      KPI_THRESHOLDS.jumper_pressure.warning,
      KPI_THRESHOLDS.jumper_pressure.inverted,
    ),
  }));
}