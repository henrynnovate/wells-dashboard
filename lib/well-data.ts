import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

const CSV_CACHE_TTL_MS = 5 * 60 * 1000;
const csvFilePath = path.join(process.cwd(), "data.csv");

export interface WellDataRow {
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

let cache: { rows: WellDataRow[]; expiresAt: number } | null = null;

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readCsvRows() {
  return new Promise<WellDataRow[]>((resolve, reject) => {
    const rows: WellDataRow[] = [];

    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row: Record<string, string>) => {
        rows.push({
          id: toNumber(row.id),
          date: row.date,
          liquid_production: toNumber(row.liquid_production),
          oil_production: toNumber(row.oil_production),
          gas_production: toNumber(row.gas_production),
          gas_to_oil_ratio: toNumber(row.gas_to_oil_ratio),
          basic_sediment_water: toNumber(row.basic_sediment_water),
          downhole_pressure: toNumber(row.downhole_pressure),
          sand_production: toNumber(row.sand_production),
          jumper_pressure: toNumber(row.jumper_pressure),
        });
      })
      .on("end", () => resolve(rows.filter((row) => row.id > 0)))
      .on("error", reject);
  });
}

export async function getWellRows(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cache && cache.expiresAt > now) {
    return cache.rows;
  }

  const rows = await readCsvRows();
  cache = {
    rows,
    expiresAt: now + CSV_CACHE_TTL_MS,
  };

  return rows;
}