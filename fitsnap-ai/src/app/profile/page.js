"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import LoadingOverlay from "@/components/LoadingOverlay";
import Script from "next/script";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";
  
  const [credits, setCredits] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, [session]);

  const fetchCredits = () => {
    if (session?.user) {
      setLoadingCredits(true);
      fetch("/api/credits")
        .then((res) => res.json())
        .then((data) => {
          if (data.credits !== undefined) setCredits(data.credits);
        })
        .catch(console.error)
        .finally(() => setLoadingCredits(false));
    } else {
      setLoadingCredits(false);
    }
  };

  const handlePayment = async (amount) => {
    if (!session) return alert("Must be logged in");

    try {
      // Step 1: Initialize transaction tracking on backend
      const res = await fetch("/api/payment/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const order = await res.json();
      
      if (order.error) {
        alert(order.error);
        return;
      }

      // Step 2: Configure UI Overlay directly mapping backend encryption hashes
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholderkeyid", // Expose publicly or provide default test hook
        amount: order.amount,
        currency: order.currency,
        name: "FitSnap AI credits",
        description: `Purchasing ${amount === 99 ? 20 : 50} Premium Credits`,
        order_id: order.id,
        handler: async function (response) {
            // Step 3: Secret verification checking signature hashes validating authenticity
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
                alert(`Transaction verified natively by Stripe/Razorpay! ${amount === 99 ? 20 : 50} Credits Deposited!`);
                fetchCredits(); // Force live UI update reflecting atomic database increment
            } else {
                alert("Security block: Unable to authenticate Webhook Hash from remote endpoint.");
            }
        },
        prefill: {
            email: session.user.email,
        },
        theme: {
            color: "#1a1a1a",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert("Payment gateway failed to load. Is checkout.js script active?");
    }
  };

  // Handle unauthenticated logic gracefully directly
  if (!isLoadingSession && !session) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Please login via the Sidebar to view your account details.</p>
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
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Manage your FitSnap AI account and credit balance.</p>
        </div>

        <div className={styles.contentGrid}>
          {/* Account Overview */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Account Overview</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{session?.user?.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Available Credits</span>
              <span className={styles.creditsValue}>
                {loadingCredits ? "..." : credits} ✨
              </span>
            </div>
          </section>

          {/* Buy Credits Mockup */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Buy Credits</h2>
            <p className={styles.buyDescription}>
              Need more virtual try-ons? Top up your account balance instantly.
            </p>

            <div className={styles.pricingGrid}>
              <div className={styles.pricingTier}>
                <div className={styles.tierHeader}>
                  <span className={styles.tierCredits}>20 Credits</span>
                  <span className={styles.tierPrice}>₹99</span>
                </div>
                <button className={styles.buyBtn} onClick={() => handlePayment(99)}>
                  Purchase
                </button>
              </div>

              <div className={`${styles.pricingTier} ${styles.popularTier}`}>
                <div className={styles.tierHeader}>
                  <span className={styles.tierCredits}>50 Credits</span>
                  <span className={styles.tierPrice}>₹199</span>
                </div>
                <button className={`${styles.buyBtn} ${styles.popularBtn}`} onClick={() => handlePayment(199)}>
                  Purchase High Value
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
