"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import GenerateButton from "@/components/GenerateButton";
import ResultSection from "@/components/ResultSection";
import LoadingOverlay from "@/components/LoadingOverlay";
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
  const [generationMode, setGenerationMode] = useState("fast"); // "fast" | "pro"

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
        body: JSON.stringify({ userImage, outfitImage, mode: generationMode }),
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

      {/* Upload & Setup Section */}
      <section className={styles.uploadSection}>
        <div className={styles.uploadGrid}>
          <ImageUpload
            label="1. Your Face"
            description="Front-facing, clear light"
            icon="👤"
            externalPreview={userImage}
            onImageSelect={handleUserImage}
          />

          {/* Outfit upload has preset logic injected */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ImageUpload
              label="2. The Outfit"
              description="Flat lay or model photo"
              icon="👗"
              externalPreview={outfitImage}
              onImageSelect={handleOutfitImage}
            />
          </div>
        </div>

        {/* AI Selection Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <div className={styles.modeToggleWrapper}>
            <button 
              className={`${styles.modeToggleBtn} ${generationMode === 'fast' ? styles.modeToggleActive : ''}`}
              onClick={() => setGenerationMode('fast')}
            >
              ⚡ Fast (1 Credit)
            </button>
            <button 
              className={`${styles.modeToggleBtn} ${generationMode === 'pro' ? styles.modeToggleActive : ''}`}
              onClick={() => setGenerationMode('pro')}
            >
              ✨ Pro HD (2 Credits)
            </button>
          </div>
        </div>
      </section>

      <GenerateButton
        onClick={handleGenerate}
        disabled={!bothReady || isLoading}
        isLoading={isLoading}
      />

      {errorText && (
        <div className={styles.errorBanner}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {errorText}
        </div>
      )}

      {resultUrl && (
        <ResultSection
          resultImage={resultUrl}
          originalUserImage={userImage}
          onReset={() => {
            setUserImage(null);
            setOutfitImage(null);
            setResultUrl(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
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
    </div>
    </>
  );
}
