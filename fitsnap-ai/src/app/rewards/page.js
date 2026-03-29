"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LoadingOverlay from "@/components/LoadingOverlay";
import styles from "./page.module.css";

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";
  const [copied, setCopied] = useState(false);

  // Generate a dummy referral link dynamically based on session or fallback
  const fallbackCode = "FT-AI-WINR";
  const referralLink = `https://fitsnap.ai/invite/${session?.user?.email?.split('@')[0] || fallbackCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <button onClick={handleCopy} className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}>
                {copied ? "Copied!" : "Copy Link"}
              </button>
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
