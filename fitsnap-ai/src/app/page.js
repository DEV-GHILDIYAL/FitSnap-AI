"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import PreviewSection from "@/components/PreviewSection";
import GenerateButton from "@/components/GenerateButton";
import ResultSection from "@/components/ResultSection";
import PresetOutfits from "@/components/PresetOutfits";
import LoadingOverlay from "@/components/LoadingOverlay";
import WardrobeGallery from "@/components/WardrobeGallery";
import { useSession } from "next-auth/react";
import styles from "./page.module.css";

// Utility component to sniff incoming Catalog clicks
function CatalogHydrator({ setOutfitImage }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const url = searchParams.get("outfitUrl");
    if (url) {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => setOutfitImage(reader.result);
          reader.readAsDataURL(blob);
        })
        .catch(console.error);
    }
  }, [searchParams, setOutfitImage]);
  return null;
}

export default function Home() {
  const [userImage, setUserImage] = useState(null);
  const [outfitImage, setOutfitImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [credits, setCredits] = useState(null);

  const { data: session, status } = useSession();

  // Fetch live credits from DynamoDB when session exists
  useEffect(() => {
    if (session?.user) {
      fetch("/api/credits")
        .then((res) => res.json())
        .then((data) => {
          if (data.credits !== undefined) setCredits(data.credits);
        })
        .catch(console.error);
    } else {
      setCredits(null);
    }
  }, [session, resultUrl]); // Refetch credits automatically whenever generation succeeds

  const handleUserImage = useCallback((_file, dataUrl) => {
    setUserImage(dataUrl);
  }, []);

  const handleOutfitImage = useCallback((_file, dataUrl) => {
    setOutfitImage(dataUrl);
  }, []);

  const bothReady = !!userImage && !!outfitImage;

  const handleGenerate = async () => {
    setErrorText("");
    setResultUrl(null);
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userImage, outfitImage }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate outfit");
      }
      
      setResultUrl(data.resultUrl);
      
      // Note: State credits refresh naturally via useEffect watching resultUrl
      
      // Scroll to bottom to show result
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <CatalogHydrator setOutfitImage={setOutfitImage} />
      </Suspense>
      <LoadingOverlay isVisible={isLoading} />
      <div className={styles.main}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.badge}>✨ AI-Powered Virtual Try-On</div>
        <h1 className={styles.title}>
          FitSnap <span className={styles.titleAccent}>AI</span>
        </h1>
        <p className={styles.subtitle}>
          Try Outfits on Yourself – Upload your photo and an outfit to see the magic.
        </p>
      </header>

      {/* Upload Section */}
      <section className={styles.uploadSection}>
        <div className={styles.uploadGrid}>
          <ImageUpload
            label="Your Photo"
            description="Upload a clear photo of yourself"
            icon="📸"
            onImageSelect={handleUserImage}
          />
          <div>
            <ImageUpload
              label="Outfit"
              description="Upload the outfit you want to try"
              icon="👗"
              onImageSelect={handleOutfitImage}
              externalPreview={outfitImage}
            />
            <PresetOutfits onSelect={handleOutfitImage} />
          </div>
        </div>
      </section>

      {/* Preview */}
      <PreviewSection userImage={userImage} outfitImage={outfitImage} />

      {/* Error / Retry Message */}
      {errorText && (
        <div className={styles.errorBanner} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {errorText}
          </span>
          <button 
            onClick={handleGenerate} 
            disabled={isLoading}
            style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Server-Side Enforced Usage Limit Message */}
      {status === "unauthenticated" && (
        <div className={styles.errorBanner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Please login securely via the Sidebar on the left to generate outfits.
        </div>
      )}

      {status === "authenticated" && credits !== null && credits <= 0 && !isLoading && (
        <div className={styles.errorBanner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          You are out of credits! Please click "My Profile" to upgrade your account.
        </div>
      )}

      {/* Generate */}
      {(!errorText && status === "authenticated" && (credits === null || credits > 0)) && (
        <GenerateButton 
          disabled={!bothReady || credits === 0} 
          isLoading={isLoading} 
          onClick={handleGenerate} 
        />
      )}

      {/* Result */}
      <ResultSection resultUrl={resultUrl} userImage={userImage} />

      {/* Persistent History Database */}
      <WardrobeGallery />

      {/* Footer */}
      <footer className={styles.footer}>
        <p>FitSnap AI &middot; Phase 9 &middot; SaaS Dashboard</p>
      </footer>
    </div>
    </>
  );
}
