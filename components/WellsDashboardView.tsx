"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ArrowIcon from "@/components/ArrowIcon";
import ArrowIconLeft from "@/components/ArrowIconLeft";
import NotesFromHenry from "@/components/NotesFromHenry";
import { STATUS_COLORS } from "@/lib/constants";
import { trackClientError, trackEvent } from "@/lib/telemetry";
import { useLiveDemo } from "@/lib/useLiveDemo";
import type { WellSummary } from "@/lib/well-summary";
import styles from "./WellsDashboardView.module.css";

const WellOverlay = dynamic(() => import("@/components/WellOverlay"), {
  ssr: false,
});

const VIEW_LABELS: Record<string, string> = {
  "/production-kpi": "Production KPI View",
  "/well-health": "Well Health View",
  "/well-integrity": "Well Integrity View",
};

interface MetricConfig {
  label: string;
  key: keyof WellSummary;
}

interface WellsDashboardViewProps {
  title: string;
  metrics: MetricConfig[];
  initialWells?: WellSummary[];
  initialError?: string | null;
  prevHref?: string;
  nextHref?: string;
}

const SKELETON_COUNT = 9;

const WellCard: React.FC<{
  well: WellSummary;
  metrics: MetricConfig[];
  onOpen: () => void;
}> = ({ well, metrics, onOpen }) => (
  <button
    type="button"
    className={styles.wellCard}
    onClick={onOpen}
    aria-label={`Open details for well W${String(well.id).padStart(3, "0")}`}
  >
    <div className={styles.wellHeader}>{`W${String(well.id).padStart(3, "0")}`}</div>
    <div className={styles.metrics}>
      {metrics.map((metric) => (
        <div key={metric.label} className={styles.metricRow}>
          <span className={styles.metricLabel}>{metric.label}</span>
          <div
            className={styles.metricBar}
            style={{
              backgroundColor:
                typeof well[metric.key] === "string"
                  ? (well[metric.key] as string)
                  : STATUS_COLORS.neutral,
            }}
          />
        </div>
      ))}
    </div>
  </button>
);

const WellsDashboardView: React.FC<WellsDashboardViewProps> = ({
  title,
  metrics,
  initialWells,
  initialError,
  prevHref,
  nextHref,
}) => {
  const router = useRouter();
  const [showIntroDialog, setShowIntroDialog] = useState(false);
  const [wells, setWells] = useState<WellSummary[]>(initialWells ?? []);
  const [selectedWell, setSelectedWell] = useState<number | null>(null);
  const [loading, setLoading] = useState(!initialWells && !initialError);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [demoEnabled, setDemoEnabled] = useState(false);

  // Restore demo state from localStorage on mount
  useEffect(() => {
    const stored = window.localStorage.getItem("demo-mode-enabled");
    if (stored === "true") {
      setDemoEnabled(true);
    }
  }, []);

  // Sync demo state to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem("demo-mode-enabled", String(demoEnabled));
  }, [demoEnabled]);

  // Simulate live well data updates when demo mode is enabled
  useLiveDemo(wells, demoEnabled, setWells);

  useEffect(() => {
    const introSeen = window.sessionStorage.getItem("henry-intro-seen") === "1";
    if (!introSeen) {
      setShowIntroDialog(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/wells");
      if (!res.ok) {
        throw new Error("Could not load wells. Please try again.");
      }

      const data: WellSummary[] = await res.json();
      setWells(data);
      trackEvent("wells_loaded", { view: title, count: data.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load wells.";
      setError(message);
      setWells([]);
      trackClientError("wells.fetch", err, { view: title });
    } finally {
      setLoading(false);
    }
  }, [title]);

  useEffect(() => {
    if (initialWells || initialError) {
      return;
    }

    fetchData();
  }, [fetchData, initialError, initialWells]);

  const visibleWells = useMemo(() => wells, [wells]);

  const statusSummary = useMemo(() => {
    const summary = { good: 0, warning: 0, critical: 0 };

    visibleWells.forEach((well) => {
      let severity: "good" | "warning" | "critical" = "good";

      metrics.forEach((metric) => {
        const color = well[metric.key];
        if (typeof color !== "string") {
          return;
        }

        if (color === STATUS_COLORS.critical) {
          severity = "critical";
          return;
        }

        if (severity !== "critical" && color === STATUS_COLORS.warning) {
          severity = "warning";
        }
      });

      summary[severity] += 1;
    });

    return summary;
  }, [metrics, visibleWells]);

  const navigateWithToast = useCallback(
    (href: string, label: string) => {
      if (isNavigating) return;

      setIsNavigating(true);
      const targetView = VIEW_LABELS[href] ?? label;
      setToastMessage(`Switching to ${targetView}...`);
      trackEvent("view_switch_started", { from: title, to: href });

      window.setTimeout(() => {
        router.push(href);
      }, 130);
    },
    [isNavigating, router, title],
  );

  return (
    <div className={styles.container}>
      <NotesFromHenry
        isVisible={showIntroDialog}
        onDismiss={() => {
          window.sessionStorage.setItem("henry-intro-seen", "1");
          setShowIntroDialog(false);
        }}
      />

      <header className={`${styles.header} ${showIntroDialog ? styles.blurred : ""} ${demoEnabled ? styles.demoMode : ""}`}>
        <div className={styles.headerTop}>
          <div>
            <p className={styles.kicker}>Operational Decision Support</p>
            <h1 className={styles.heading}>{title}</h1>
          </div>
          <button
            type="button"
            className={`${styles.demoToggle} ${demoEnabled ? styles.demoActive : ""}`}
            onClick={() => {
              setDemoEnabled(!demoEnabled);
              trackEvent("demo_toggled", { view: title, enabled: !demoEnabled });
            }}
            aria-pressed={demoEnabled}
            title={demoEnabled ? "Disable live demo mode" : "Enable live demo mode"}
          >
            {demoEnabled ? (
              <>
                <span className={styles.demoPulse} aria-hidden="true" />
                LIVE DEMO
              </>
            ) : (
              "Enable Demo"
            )}
          </button>
        </div>
        <p className={styles.subtitle}>
          Monitor performance health in one place and open any well card for deeper production context.
        </p>
      </header>

      <div className={`${styles.contentArea} ${showIntroDialog ? styles.blurred : ""}`}>
        <section className={styles.summaryRail} aria-label="Well status summary">
          <span className={styles.summaryPill}>{`Wells: ${visibleWells.length}`}</span>
          <span className={styles.summaryPillGood}>{`Good: ${statusSummary.good}`}</span>
          <span className={styles.summaryPillWarning}>{`Warning: ${statusSummary.warning}`}</span>
          <span className={styles.summaryPillCritical}>{`Critical: ${statusSummary.critical}`}</span>
        </section>

        <section className={styles.legend} aria-label="Metric legend and definitions">
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: STATUS_COLORS.good }} />
            Good
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: STATUS_COLORS.warning }} />
            Warning
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: STATUS_COLORS.critical }} />
            Critical
          </span>
        </section>

        {loading && (
          <div className={styles.gridWrap}>
            <div className={styles.grid} aria-label="Loading wells">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <div key={index} className={styles.skeletonCard} />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div className={styles.stateBox} role="alert">
            <p>{error}</p>
            <button type="button" className={styles.retryButton} onClick={fetchData}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && visibleWells.length === 0 && (
          <div className={styles.stateBox}>
            <p>No wells found.</p>
          </div>
        )}

        {!loading && !error && visibleWells.length > 0 && (
          <div className={styles.gridWrap}>
            <div className={styles.grid}>
              {visibleWells.map((well) => (
                <WellCard
                  key={`${title}-${well.id}`}
                  well={well}
                  metrics={metrics}
                  onOpen={() => {
                    setSelectedWell(well.id);
                    trackEvent("well_opened", { view: title, wellId: well.id });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedWell !== null && (
        <WellOverlay
          wellId={selectedWell}
          onClose={() => {
            setSelectedWell(null);
            trackEvent("well_overlay_closed", { view: title });
          }}
        />
      )}

      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}

      {prevHref && (
        <button
          type="button"
          className={styles.floatingButtonLeft}
          aria-label="Go to previous view"
          title="Previous view"
          onClick={() => navigateWithToast(prevHref, "previous view")}
          disabled={isNavigating}
        >
          <ArrowIconLeft className={styles.icon} />
        </button>
      )}

      {nextHref && (
        <button
          type="button"
          className={styles.floatingButton}
          aria-label="Go to next view"
          title="Next view"
          onClick={() => navigateWithToast(nextHref, "next view")}
          disabled={isNavigating}
        >
          <ArrowIcon className={styles.icon} />
        </button>
      )}
    </div>
  );
};

export default WellsDashboardView;
