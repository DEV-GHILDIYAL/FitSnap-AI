"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LoadingOverlay from "@/components/LoadingOverlay";
import styles from "./page.module.css";

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://fitsnap.ai");

  // capture current origin for dynamic link
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Generate a dummy referral link dynamically based on session or fallback
  const fallbackCode = "FT-AI-WINR";
  const referralLink = `${baseUrl}/invite/${session?.user?.email?.split('@')[0] || fallbackCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! I'm trying on outfits virtually with AI on FitSnap. Use my link to get +10 search credits: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (!isLoadingSession && !session) {
    return (
      <div className={styles.container}>
        <div className={styles.lockedState}>
          <h2>🔒 Refer & Earn is Locked</h2>
          <p>Please log in using the sidebar to view your unique referral link.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isVisible={isLoadingSession} />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>🚀 Growth Hack</div>
          <h1 className={styles.title}>Invite Friends. Earn Free Credits.</h1>
          <p className={styles.subtitle}>
            Give your friends an exclusive gift. When they sign up using your link and generate their first outfit, you both receive +10 HD Generation Credits instantly.
          </p>
        </div>

        <div className={styles.mainCard}>
          <div className={styles.copyBlock}>
            <p className={styles.label}>Your Unique Share Link</p>
            <div className={styles.inputGroup}>
              <input type="text" readOnly value={referralLink} className={styles.linkInput} />
              <div className={styles.actionRow}>
                <button onClick={handleCopy} className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button onClick={handleWhatsApp} className={styles.whatsappBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  Share to WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.iconCircle}>1</div>
              <h3>Share The Link</h3>
              <p>Send your unique fitsnap.ai tracking link directly to your friends on WhatsApp or Twitter.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.iconCircle}>2</div>
              <h3>They Sign Up</h3>
              <p>Your friend registers their account and makes their first free virtual try-on.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.iconCircle}>3</div>
              <h3>Both Get Credits</h3>
              <p>You automatically receive +10 Credits straight into your database balance. Unlimited pairs!</p>
            </div>
          </div>
        </div>

        <div className={styles.statisticsBlock}>
          <div className={styles.statBox}>
            <p className={styles.statNumber}>0</p>
            <p className={styles.statLabel}>Friends Invited</p>
          </div>
          <div className={styles.statBox}>
            <p className={styles.statNumber}>0</p>
            <p className={styles.statLabel}>Credits Earned</p>
          </div>
        </div>
      </div>
    </>
  );
}
