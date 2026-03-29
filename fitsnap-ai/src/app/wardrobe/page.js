"use client";

import { useSession } from "next-auth/react";
import WardrobeGallery from "@/components/WardrobeGallery/WardrobeGallery";
import LoadingOverlay from "@/components/LoadingOverlay";
import styles from "./page.module.css";

export default function WardrobePage() {
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  if (!isLoadingSession && !session) {
    return (
      <div className={styles.container}>
        <div className={styles.lockedState}>
          <h2>🔒 Your Wardrobe is Locked</h2>
          <p>Please log in using the sidebar to view your saved generated outfits.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isVisible={isLoadingSession} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Wardrobe</h1>
          <p className={styles.subtitle}>
            All your generated virtual outfits saved chronologically. Hover over images to download HD versions or delete them permanently.
          </p>
        </div>
        
        {/* Render the extracted Gallery */}
        <div className={styles.galleryWrapper}>
          <WardrobeGallery />
        </div>
      </div>
    </>
  );
}
