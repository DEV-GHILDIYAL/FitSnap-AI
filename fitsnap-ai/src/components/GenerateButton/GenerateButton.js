"use client";

import styles from "./GenerateButton.module.css";

export default function GenerateButton({ disabled, isLoading, onClick }) {
  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.button} ${(disabled || isLoading) ? styles.disabled : ""} ${isLoading ? styles.loading : ""}`}
        disabled={disabled || isLoading}
        onClick={onClick}
        id="generate-outfit-btn"
      >
        <span className={styles.bg} />
        <span className={styles.content}>
          {isLoading ? (
            <svg
              className={styles.spinner}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icon}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {isLoading ? "Generating..." : "Generate Outfit"}
        </span>
      </button>
      {(disabled && !isLoading) && (
        <p className={styles.hint}>Upload both images to continue</p>
      )}
    </div>
  );
}
