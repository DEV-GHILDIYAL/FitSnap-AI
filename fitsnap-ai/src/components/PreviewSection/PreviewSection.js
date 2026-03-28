"use client";

import styles from "./PreviewSection.module.css";

export default function PreviewSection({ userImage, outfitImage }) {
  const hasUser = !!userImage;
  const hasOutfit = !!outfitImage;

  if (!hasUser && !hasOutfit) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.dividerLine} />
        <h2 className={styles.title}>Preview</h2>
        <div className={styles.dividerLine} />
      </div>

      <div className={styles.grid}>
        {/* User Photo Card */}
        <div className={`${styles.card} ${hasUser ? styles.active : styles.empty}`}>
          <div className={styles.cardLabel}>
            <span className={styles.cardIcon}>👤</span>
            Your Photo
          </div>
          {hasUser ? (
            <div className={styles.imageWrapper}>
              <img src={userImage} alt="Your uploaded photo" className={styles.image} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIcon}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Awaiting upload</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={styles.mergeDivider}>
          <div className={styles.mergeIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
          <span className={styles.mergeLabel}>+</span>
          <div className={styles.mergeIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
        </div>

        {/* Outfit Card */}
        <div className={`${styles.card} ${hasOutfit ? styles.active : styles.empty}`}>
          <div className={styles.cardLabel}>
            <span className={styles.cardIcon}>👗</span>
            Outfit
          </div>
          {hasOutfit ? (
            <div className={styles.imageWrapper}>
              <img src={outfitImage} alt="Selected outfit" className={styles.image} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIcon}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Awaiting upload</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
