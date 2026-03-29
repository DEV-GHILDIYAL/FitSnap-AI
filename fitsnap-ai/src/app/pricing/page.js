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

  const handlePayment = async (amount) => {
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "FitSnap AI credits",
        description: `Purchasing credits for ₹${amount}`,
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

  const tiers = [
    {
      name: "Standard",
      price: "0",
      credits: "3 Credits",
      description: "Perfect for testing the AI magic",
      features: ["Fast Generation Mode", "Basic AI Tuning", "Contains Watermark", "Community Support"],
      btnText: "Welcome Pack",
      isFree: true,
    },
    {
      name: "Starter",
      price: "1",
      credits: "20 Credits",
      description: "Boost your style experiments",
      features: ["20 High-Speed Credits", "🔥 No Watermark", "HD Image Downloads", "Priority Processing"],
      btnText: "Get Starter",
      isFree: false,
    },
    {
      name: "Pro",
      price: "2",
      credits: "50 Credits",
      description: "Best for fashion enthusiasts",
      features: ["50 High-Speed Credits", "✨ No Watermark", "Ultra-HD 4K Quality", "Commercial Use License"],
      btnText: "Buy Pro Bundle",
      isFree: false,
      popular: true,
    },
    {
      name: "Elite",
      price: "3",
      credits: "150 Credits",
      description: "For professionals & creators",
      features: ["150 Bulk Credits", "🚀 No Watermark", "Personal Style Advisor", "API Beta Access"],
      btnText: "Get Elite Access",
      isFree: false,
    }
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <LoadingOverlay isVisible={loading} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Unlock Your Style Potential</h1>
          <p className={styles.subtitle}>Choose a credit pack to start your virtual transformation. High-speed AI fashion at your fingertips.</p>
        </div>

        <div className={styles.pricingGrid}>
          {tiers.map((tier, idx) => (
            <div key={idx} className={`${styles.tierCard} ${tier.popular ? styles.popularCard : ""}`}>
              {tier.popular && <div className={styles.popularBadge}>Popular</div>}
              
              <div className={styles.tierInfo}>
                <span className={styles.tierName}>{tier.name}</span>
                <div className={styles.tierPriceWrapper}>
                  <span className={styles.currency}>₹</span>
                  <span className={styles.price}>{tier.price}</span>
                </div>
                <div className={styles.creditsCount}>
                  <span>✨ {tier.credits}</span>
                </div>
              </div>

              <ul className={styles.featuresList}>
                {tier.features.map((f, i) => (
                  <li key={i} className={styles.feature}>
                    <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                className={`${styles.buyBtn} ${tier.popular ? styles.popularBtn : ""}`}
                onClick={() => !tier.isFree && handlePayment(parseInt(tier.price))}
                disabled={tier.isFree}
              >
                {tier.isFree ? "Already Active" : tier.btnText}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.guarantee}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Secure checkout via Razorpay • Credits never expire</span>
        </div>
      </div>
    </>
  );
}
