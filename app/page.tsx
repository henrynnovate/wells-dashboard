"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/telemetry";
import styles from "./LandingIntro.module.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/production-kpi");

    const timer = setTimeout(() => {
      trackEvent("landing_auto_redirect", { to: "/production-kpi" });
      router.replace("/production-kpi");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className={styles.screen}>
      <div className={styles.gridPattern} aria-hidden="true" />

      <section className={styles.panel} aria-label="Dashboard introduction">
        <p className={styles.kicker}>Oil Well Performance Dashboard</p>
        <h1 className={styles.title}>Turning scattered well data into clear operational decisions</h1>
        <p className={styles.copy}>
          This prototype centralizes oil rate, gas rate, water cut, and pressure signals into one
          intuitive workspace. Instead of hunting through disconnected reports, production and field
          teams can spot decline patterns early and act faster with confidence.
        </p>

        <div className={styles.row}>
          <span className={styles.badge}>Production KPI</span>
          <span className={styles.badge}>Well Health</span>
          <span className={styles.badge}>Well Integrity</span>
        </div>

        <div className={styles.progressWrap}>
          <p className={styles.progressLabel}>Initializing dashboard view</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} />
          </div>
        </div>
      </section>
    </main>
  );
}