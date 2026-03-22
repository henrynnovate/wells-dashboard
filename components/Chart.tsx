"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { trackClientError } from "@/lib/telemetry";
import styles from "./Chart.module.css";

interface ChartProps {
  title: string;
  dataKey: keyof WellMetrics;
  wellId: number; // ✅ Use `id` directly instead of `well_id`
}

export interface WellMetrics {
  id: number;
  date: string; // Store dates as strings in ISO format
  liquid_production: number;
  oil_production: number;
  gas_production: number;
  gas_to_oil_ratio: number;
  basic_sediment_water: number;
  downhole_pressure: number;
  sand_production: number;
  jumper_pressure: number;
}

const Chart: React.FC<ChartProps> = ({ title, dataKey, wellId }) => {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);

      try {
        const response = await fetch(`/api/well-metrics?wellId=${wellId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const result: WellMetrics[] = await response.json();

        if (!Array.isArray(result) || result.length === 0) {
          setData([]);
          return;
        }

        const filteredData = result.map((item) => ({
          date: item.date ?? "N/A",
          value: Number(item[dataKey]),
        }));

        setData(filteredData);
      } catch (err) {
        setData([]);
        setError("Unable to load chart data.");
        trackClientError("chart.fetch", err, { wellId, dataKey });
      }
    };

    fetchData();
  }, [dataKey, wellId]);

  const hasData = data.some((point) => point.value > 0);

  return (
    <div className={styles.chart}>
      <h3>{title}</h3>
      {error && <p>{error}</p>}
      {!error && !hasData && <p>No chart data available.</p>}
      {!error && hasData && (
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Chart;
