"use client";

import { useState, useEffect } from "react";
import styles from "./LoadingOverlay.module.css";

const MESSAGES = [
  "🔍 Analyzing body proportions...",
  "👗 Extracting garment textures...",
  "🧠 Synthesizing AI fabric drape...",
  "🧪 Calibrating lighting and shadows...",
  "✨ Finalizing your virtual look...",
];

export default function LoadingOverlay({ isVisible, message }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMsgIndex(0);
      return;
    }

    if (message) return; // Don't cycle if a static message is provided

    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1 < MESSAGES.length ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, [isVisible, message]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.glassCard}>
        <div className={styles.spinner} />
        <p className={styles.message} key={message || msgIndex}>
          {message || MESSAGES[msgIndex]}
        </p>
        {!message && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ animationDuration: `${MESSAGES.length * 2.5}s` }} />
          </div>
        )}
      </div>
    </div>
  );
}
