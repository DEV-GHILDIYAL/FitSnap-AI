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
            setHistory(data.history.reverse()); // Show newest first
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleDelete = async (url) => {
    if (!confirm("Delete this outfit forever?")) return;
    
    // Optimistic UI updates
    const oldHistory = [...history];
    setHistory((prev) => prev.filter(item => item.resultUrl !== url));

    try {
      const res = await fetch("/api/history/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch (e) {
      console.error(e);
      setHistory(oldHistory);
      alert("Failed to delete outfit.");
    }
  };

  const handleDownloadHD = async (url) => {
    try {
      // Open in a new tab which inherently allows long presses and "Save Image As" on Mobile/Desktop devices
      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
      alert("Could not download image.");
    }
  };

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
              <img src={item.resultUrl} alt={`Outfit on ${new Date(item.createdAt).toLocaleDateString()}`} className={styles.image} />
              
              {/* Hover Actions Overlay */}
              <div className={styles.overlay}>
                <button className={styles.actionBtn} onClick={() => handleDownloadHD(item.resultUrl)} title="Download HD">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>

                <button className={`${styles.actionBtn} ${styles.actionBtnDestructive}`} onClick={() => handleDelete(item.resultUrl)} title="Delete Forever">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
