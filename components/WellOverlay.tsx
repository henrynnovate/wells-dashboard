"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { trackClientError, trackEvent } from "@/lib/telemetry";
import styles from "./WellOverlay.module.css";

interface WellOverlayProps {
  wellId: number | null;
  onClose: () => void;
}

interface WellMetrics {
  id: number;
  liquid_production: number;
  oil_production: number;
  gas_production: number;
  gas_to_oil_ratio: number;
  sand_production: number;
  jumper_pressure: number;
}

const formatMetric = (value: number, unit: string) => {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
};

const WellOverlay: React.FC<WellOverlayProps> = ({ wellId, onClose }) => {
  const [wellData, setWellData] = useState<WellMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const fetchData = useCallback(async () => {
    if (wellId === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/well-metrics?wellId=${wellId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch well data");
      }

      const data: WellMetrics[] = await response.json();
      if (data.length > 0) {
        setWellData(data[0]);
      } else {
        setWellData(null);
        setError("No data found for this well.");
      }
    } catch (err) {
      setWellData(null);
      setError("We could not load this well. Please retry.");
      trackClientError("well-overlay.fetch", err, { wellId });
    } finally {
      setLoading(false);
    }
  }, [wellId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const oil = wellData?.oil_production ?? 0;
  const gas = wellData?.gas_production ?? 0;
  const water = Math.max((wellData?.liquid_production ?? 0) - oil, 0);

  const pieData = [
    { name: "Oil", value: oil, color: "#2ca02c" },
    { name: "Gas", value: gas, color: "#ff7f0e" },
    { name: "Water", value: water, color: "#1f77b4" },
  ];

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
          trackEvent("well_overlay_closed", { reason: "backdrop" });
        }
      }}
    >
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="well-overlay-title"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={() => {
            onClose();
            trackEvent("well_overlay_closed", { reason: "close-button" });
          }}
          aria-label="Close well details"
        >
          ✕
        </button>

        <h2 id="well-overlay-title" className={styles.title}>
          Well {wellId ? `W${String(wellId).padStart(3, "0")}` : "Unknown"}
        </h2>
        <p className={styles.subtitle}>
          Performance snapshot for production quality, flow balance, and pressure behavior.
        </p>

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} aria-hidden="true" />
            <p>Loading well details...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage} role="alert">
            <p>{error}</p>
            <button type="button" className={styles.retryButton} onClick={fetchData}>
              Retry
            </button>
          </div>
        )}

        {!loading && wellData && (
          <>
            <div className={styles.kpiContainer}>
              {[
                ["Liquid Production", wellData.liquid_production, "bbl/d", "#007bff"],
                ["Oil Production", wellData.oil_production, "bbl/d", "#2ca02c"],
                ["Gas Production", wellData.gas_production, "scf/d", "#ff7f0e"],
                ["Gas-Oil Ratio", wellData.gas_to_oil_ratio, "", "#d62728"],
                ["Sand Production", wellData.sand_production, "lb/d", "#6c757d"],
                ["Jumper Pressure", wellData.jumper_pressure, "psi", "#007bff"],
              ].map(([label, value, unit, icon], index) => (
                <div key={index} className={styles.kpiItem}>
                  <span className={styles.kpiLabel}>
                    <span className={styles.kpiDot} style={{ backgroundColor: icon as string }} />
                    {label}
                  </span>
                  <span className={styles.kpiValue}>{formatMetric(Number(value), String(unit))}</span>
                </div>
              ))}
            </div>

            <div className={styles.chartsContainer}>
              <div className={styles.chartBox}>
                <h4>Fluid Composition</h4>
                {pieData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.chartEmpty}>No production composition data available.</p>
                )}
              </div>

              <div className={styles.chartBox}>
                <h4>Gas-to-Oil Ratio Trend Marker</h4>
                {wellData.gas_to_oil_ratio > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart
                      innerRadius="40%"
                      outerRadius="90%"
                      data={[{ name: "GOR", value: wellData.gas_to_oil_ratio }]}
                    >
                      <RadialBar dataKey="value" fill="#d62728" />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.chartEmpty}>No gas-to-oil ratio data available.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WellOverlay;
