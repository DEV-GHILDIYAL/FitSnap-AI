"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./WardrobeGallery.module.css";

export default function WardrobeGallery() {
  const { data: session } = useSession();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      fetch("/api/history")
        .then((res) => res.json())
        .then((data) => {
          if (data.history) {
            setHistory(data.history);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (!session) return null;

  return (
    <section className={styles.gallerySection}>
      <div className={styles.header}>
        <h2>My Wardrobe</h2>
        <span className={styles.badge}>{history.length} Saved</span>
      </div>

      {loading ? (
        <div className={styles.loadingGallery}>Loading wardrobe history...</div>
      ) : history.length === 0 ? (
        <div className={styles.emptyState}>
          Your wardrobe is empty. Generate your first outfit above!
        </div>
      ) : (
        <div className={styles.grid}>
          {history.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <img src={item.resultUrl} alt={`Generated outfit on ${new Date(item.createdAt).toLocaleDateString()}`} className={styles.image} />
              <div className={styles.cardFooter}>
                <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
                <a href={item.resultUrl} target="_blank" rel="noreferrer" className={styles.downloadLink}>View Original</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
