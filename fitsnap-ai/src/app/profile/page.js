"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import LoadingOverlay from "@/components/LoadingOverlay";
import Script from "next/script";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";
  
  const [credits, setCredits] = useState(0);
  const [displayCredits, setDisplayCredits] = useState(0);
  const [history, setHistory] = useState([]);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [session]);

  const fetchUserData = async () => {
    if (!session?.user) return;
    
    setLoadingCredits(true);
    try {
      // Fetch Credits
      const credRes = await fetch("/api/credits");
      const credData = await credRes.json();
      if (credData.credits !== undefined) setCredits(credData.credits);

      // Fetch History for Activity Feed
      const histRes = await fetch("/api/history");
      const histData = await histRes.json();
      setHistory(histData.history?.slice(0, 5) || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCredits(false);
    }
  };

  // Animation logic for Credit Counter
  useEffect(() => {
    if (credits > 0) {
      let start = 0;
      const end = credits;
      const duration = 1000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayCredits(end);
          clearInterval(timer);
        } else {
          setDisplayCredits(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    } else {
      setDisplayCredits(0);
    }
  }, [credits]);

  const handlePayment = async (amount) => {
    if (!session) return;

    try {
      const res = await fetch("/api/payment/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const order = await res.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "FitSnap AI credits",
        description: `Purchasing ${amount === 99 ? 20 : 50} Premium Credits`,
        order_id: order.id,
        handler: async function (response) {
            const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    amount
                }),
            });
            
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
                fetchUserData(); 
            }
        },
        prefill: { email: session.user.email },
        theme: { color: "#1e293b" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
    }
  };

  if (!isLoadingSession && !session) {
    return (
      <div className={styles.container}>
        <div className={styles.lockedState}>
          <h2>🔒 Access Restricted</h2>
          <p>Please log in to manage your premium fashion profile.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <LoadingOverlay isVisible={isLoadingSession} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Member Studio</h1>
          <p className={styles.subtitle}>Your personalized fashion HQ & credit management.</p>
        </div>

        <div className={styles.contentGrid}>
          {/* Top: Profile Info Header */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {session?.user?.email?.[0].toUpperCase() || "F"}
              </div>
            </div>
            <div className={styles.profileInfo}>
              <h2>{session?.user?.name || "Premium Member"}</h2>
              <div className={styles.profileEmail}>{session?.user?.email}</div>
            </div>
          </div>

          <div className={styles.dashboardGrid}>
            {/* Left: Premium Member Card & Status */}
            <div className={styles.sideContent}>
              <section className={styles.memberCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.chip} />
                  <span className={styles.memberType}>Exclusive Member</span>
                </div>
                
                <div className={styles.creditDisplay}>
                  <div className={styles.creditValue}>
                    {loadingCredits ? "..." : displayCredits}
                  </div>
                  <span className={styles.creditLabel}>Live Credits Available</span>
                </div>

                <button 
                  className={styles.buyCreditsShortcut}
                  onClick={() => router.push("/pricing")}
                >
                  ✨ Buy More Credits
                </button>
              </section>

              <div className={styles.profileStats}>
                <div className={styles.statLine}>
                  <span>Total Generations</span>
                  <strong>{history.length}+</strong>
                </div>
                <div className={styles.statLine}>
                  <span>Member Since</span>
                  <strong>{new Date().getFullYear()}</strong>
                </div>
              </div>
            </div>

            {/* Right: Activity Feed */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Recent Activity</h2>
              <table className={styles.activityTable}>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Ref ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? history.map((item, idx) => (
                    <tr key={idx}>
                      <td>AI Generation</td>
                      <td>#{item.timestamp?.toString().slice(-6) || "FIT-"+idx}</td>
                      <td><span className={styles.statusSuccess}>Completed</span></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>No recent activity to show.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
