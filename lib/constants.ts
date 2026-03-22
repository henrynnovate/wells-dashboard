export const STATUS_COLORS = {
  good: "#22C55E",
  warning: "#FACC15",
  critical: "#EF4444",
  neutral: "#D1D5DB",
} as const;

export const KPI_THRESHOLDS = {
  liquid_production: { good: 1200, warning: 900, inverted: false },
  oil_production: { good: 800, warning: 650, inverted: false },
  gas_production: { good: 5500, warning: 4500, inverted: false },
  gas_to_oil_ratio: { good: 8.0, warning: 6.5, inverted: true },
  basic_sediment_water: { good: 0.3, warning: 0.7, inverted: true },
  downhole_pressure: { good: 2800, warning: 2300, inverted: false },
  sand_production: { good: 0.2, warning: 0.5, inverted: true },
  jumper_pressure: { good: 2200, warning: 1700, inverted: false },
} as const;

export function getStatusColor(
  value: number,
  good: number,
  warning: number,
  inverted = false,
) {
  if (inverted) {
    if (value <= good) return STATUS_COLORS.good;
    if (value <= warning) return STATUS_COLORS.warning;
    return STATUS_COLORS.critical;
  }

  if (value >= good) return STATUS_COLORS.good;
  if (value >= warning) return STATUS_COLORS.warning;
  return STATUS_COLORS.critical;
}