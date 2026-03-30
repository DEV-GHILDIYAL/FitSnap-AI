"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Script from "next/script";
import styles from "./page.module.css";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async (amount, bundle) => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payment/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const order = await res.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "FitSnap Credit Shop ⚡",
        description: `Purchasing ${bundle.credits} Credits`,
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
                router.push("/profile?success=true");
            }
        },
        prefill: { email: session.user.email },
        theme: { color: "#10b981" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const bundles = [
    { id: 1, name: "Micro Pack", price: "49", credits: "10", label: "Quick Start" },
    { id: 2, name: "Starter Kit", price: "99", credits: "25", label: "Beginner Choice" },
    { id: 3, name: "Standard", price: "199", credits: "60", label: "Regular User" },
    { id: 4, name: "Value Pack", price: "449", credits: "150", label: "Best Value", popular: true },
    { id: 5, name: "Pro Stack", price: "999", credits: "350", label: "Creator Choice" },
    { id: 6, name: "Elite Bulk", price: "2199", credits: "800", label: "Professional" },
    { id: 7, name: "Master Set", price: "4999", credits: "2,000", label: "Hardcore Set" },
    { id: 8, name: "Enterprise", price: "11999", credits: "5,000", label: "Enterprise" },
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <LoadingOverlay isVisible={loading} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Supercharge Your Wardrobe ⚡</h1>
          <p className={styles.subtitle}>Supercharge your wardrobe with high-speed AI generations.</p>
        </div>

        <div className={styles.pricingGrid}>
          {bundles.map((bundle) => (
            <div key={bundle.id} className={`${styles.tierCard} ${bundle.popular ? styles.popularCard : ""}`}>
              {bundle.popular && <div className={styles.popularBadge}>Best Value</div>}
              
              <div className={styles.cardContent}>
                <div className={styles.bundleIcon}>⚡</div>
                <h3 className={styles.bundleName}>{bundle.name}</h3>
                <span className={styles.bundleLabel}>{bundle.label}</span>
                
                <div className={styles.creditsMain}>
                  <span className={styles.creditsNum}>{bundle.credits}</span>
                  <span className={styles.creditsText}>Credits</span>
                </div>

                <div className={styles.priceContainer}>
                  <span className={styles.curr}>₹</span>
                  <span className={styles.amt}>{bundle.price}</span>
                </div>
              </div>

              <button 
                className={`${styles.buyBtn} ${bundle.popular ? styles.popularBtn : ""}`}
                onClick={() => handlePayment(parseInt(bundle.price), bundle)}
              >
                Purchase
              </button>
            </div>
          ))}
        </div>

        <div className={styles.guarantee}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Powered by Razorpay • Instant Crediting • Secure Gateway</span>
        </div>
      </div>
    </>
  );
}
