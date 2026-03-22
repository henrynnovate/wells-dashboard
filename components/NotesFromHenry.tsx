"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./NotesFromHenry.module.css";

interface NotesFromHenryProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const MESSAGE_CHUNKS = [
  "Welcome. This prototype was built to solve a daily operations problem: engineers spend too much time piecing well performance data together before they can act.",
  "In many production workflows, oil rate, gas rate, water cut, and pressure are spread across disconnected sources, slowing analysis and delaying decisions.",
  "This dashboard brings those signals into one clear workspace with interactive trend views, so production and asset teams can interpret well behavior faster.",
  "The goal is proactive optimization: spot decline early, flag anomalies sooner, and reduce cognitive load so decisions are faster and more confident.",
  "Use Production KPI, Well Health, and Well Integrity views together for a complete picture of performance.",
];

export default function NotesFromHenry({ isVisible, onDismiss }: NotesFromHenryProps) {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [hideTips, setHideTips] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCurrentChunkIndex(0);
      return;
    }

    const shouldHide = window.localStorage.getItem("henry-hide-tips") === "1";
    if (shouldHide) {
      onDismiss();
      return;
    }

    setCurrentChunkIndex(0);

    return undefined;
  }, [isVisible, onDismiss]);

  const handleToggleHideTips = () => {
    const nextValue = !hideTips;
    setHideTips(nextValue);
    if (nextValue) {
      window.localStorage.setItem("henry-hide-tips", "1");
      return;
    }

    window.localStorage.removeItem("henry-hide-tips");
  };

  const handleNext = () => {
    if (currentChunkIndex >= MESSAGE_CHUNKS.length - 1) {
      onDismiss();
      return;
    }

    setCurrentChunkIndex((prev) => prev + 1);
  };

  if (!isVisible) return null;

  const activeMessage = MESSAGE_CHUNKS[currentChunkIndex] ?? MESSAGE_CHUNKS[0] ?? "";
  const isLastMessage = currentChunkIndex >= MESSAGE_CHUNKS.length - 1;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Notes from Henry">
      <div className={styles.guideWrap}>
        <div className={styles.avatarWrap} aria-hidden="true">
          <Image
            src="/character%20face.jpeg"
            alt="Henry"
            width={72}
            height={72}
            className={styles.avatar}
            priority
          />
        </div>

        <div className={styles.card}>
          <h2 className={styles.title}>NOTES FROM HENRY</h2>
          <p className={styles.step}>{`Insight ${currentChunkIndex + 1} of ${MESSAGE_CHUNKS.length}`}</p>
          <p key={currentChunkIndex} className={styles.message}>
            {activeMessage}
          </p>

          <div className={styles.footerRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={hideTips}
                onChange={handleToggleHideTips}
                className={styles.checkbox}
              />
              Hide tips next time
            </label>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.dismissButton} onClick={onDismiss}>
                Dismiss
              </button>
              <button type="button" className={styles.nextButton} onClick={handleNext}>
                {isLastMessage ? "Proceed" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
