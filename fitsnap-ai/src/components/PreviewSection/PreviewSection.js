"use client";

import styles from "./PreviewSection.module.css";

export default function PreviewSection({ userImage, outfitImage }) {
  const hasUser = !!userImage;
  const hasOutfit = !!outfitImage;

  if (!hasUser && !hasOutfit) return null;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Preview</h2>
        <p className={styles.subtitle}>Confirm your selection before processing</p>
      </div>

      <div className={styles.previewGrid}>
        {/* User Photo Card */}
        <div className={styles.previewCard}>
          <div className={styles.label}>1. Your Photo</div>
          <div className={styles.imageBox}>
            {hasUser ? (
              <img src={userImage} alt="Your uploaded photo" className={styles.image} />
            ) : (
              <div className={styles.placeholder}>Awaiting upload</div>
            )}
          </div>
        </div>

        {/* Divider icon */}
        <div className={styles.divider}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>

        {/* Outfit Card */}
        <div className={styles.previewCard}>
          <div className={styles.label}>2. The Outfit</div>
          <div className={styles.imageBox}>
            {hasOutfit ? (
              <img src={outfitImage} alt="Selected outfit" className={styles.image} />
            ) : (
              <div className={styles.placeholder}>Awaiting selection</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
