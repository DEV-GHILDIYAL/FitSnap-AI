"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import GenerateButton from "@/components/GenerateButton";
import ResultSection from "@/components/ResultSection";
import LoadingOverlay from "@/components/LoadingOverlay";
import PersonaStudio from "@/components/PersonaStudio/PersonaStudio";
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

const QUICK_PRESETS = [
  { id: "p1", name: "Classic White Tee", category: "top", url: "/presets/white_tee.png" },
  { id: "p2", name: "Leather Jacket", category: "top", url: "/presets/leather_jacket.png" },
  { id: "p3", name: "Summer Floral", category: "full", url: "/presets/summer_dress.png" },
  { id: "p4", name: "Formal Blazer", category: "top", url: "/presets/navy_suit.png" },
  { id: "p5", name: "Blue Jeans", category: "bottom", url: "/presets/blue_jeans.png" },
];

import { uploadToS3, triggerGeneration, pollStatus } from "@/lib/v2_client_helper";

export default function Home() {
  const [userImage, setUserImage] = useState(null);
  const [userFile, setUserFile] = useState(null);
  const [outfitImage, setOutfitImage] = useState(null);
  const [outfitFile, setOutfitFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [credits, setCredits] = useState(null);
  const [generationMode, setGenerationMode] = useState("fast"); // "fast" | "pro"
  const [gender, setGender] = useState("female");
  const [category, setCategory] = useState("top");

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

  const handleUserImage = useCallback((file, dataUrl) => {
    setUserImage(dataUrl);
    setUserFile(file);
  }, []);

  const handleOutfitImage = useCallback((file, dataUrl) => {
    setOutfitImage(dataUrl);
    setOutfitFile(file);
  }, []);

  const handleMannequinSelect = useCallback((dataUrl) => {
    setUserImage(dataUrl);
    setUserFile(null); // It's a preset URL, not a new file
  }, []);

  const bothReady = !!userImage && !!outfitImage;

  const handleGenerate = async () => {
    setErrorText("");
    setResultUrl(null);
    setIsLoading(true);
    setLoadingStatus("Preparing Studio...");
    
    try {
      // 1. Upload Human Photo (if it's a new local file)
      let finalUserDataUrl = userImage;
      if (userFile) {
        setLoadingStatus("Uploading Your Photo...");
        const { publicUrl } = await uploadToS3(userFile);
        finalUserDataUrl = publicUrl;
      }

      // 2. Upload Outfit Photo (if it's a new local file)
      let finalOutfitDataUrl = outfitImage;
      if (outfitFile) {
        setLoadingStatus("Uploading The Outfit...");
        const { publicUrl } = await uploadToS3(outfitFile);
        finalOutfitDataUrl = publicUrl;
      }

      // 3. Trigger Async Generation
      setLoadingStatus("Waking up AI Artisans...");
      const requestId = await triggerGeneration(finalUserDataUrl, finalOutfitDataUrl, category);

      // 4. Poll for Result
      setLoadingStatus("Synthesizing your look...");
      const finalResult = await pollStatus(requestId, (update) => {
        if (update.status === "PROCESSING") {
          setLoadingStatus("AI is stitching the fabric...");
        }
      });

      setResultUrl(finalResult);
      
      // Scroll to bottom to show result
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <CatalogHydrator setOutfitImage={setOutfitImage} />
      </Suspense>
      <LoadingOverlay isVisible={isLoading} message={loadingStatus} />
      <div className={styles.main}>
        <div className={styles.studioContainer}>
          {/* Hero */}
          <header className={styles.hero}>
            <div className={styles.badge}>✨ Next-Gen AI Virtual Salon</div>
            <h1 className={styles.title}>
              FitSnap <span className={styles.titleAccent}>Studio</span>
            </h1>
            <p className={styles.subtitle}>
              The ultimate AI dressing room — personalized to your style, gender, and fit.
            </p>
          </header>

          {/* Step Flow Indicators */}
          <div className={styles.stepFlow}>
            <div className={`${styles.step} ${styles.stepActive}`}>
              <div className={styles.stepIcon}>1</div>
              <span className={styles.stepLabel}>Setup</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.step} ${userImage ? styles.stepActive : ""}`}>
              <div className={styles.stepIcon}>2</div>
              <span className={styles.stepLabel}>Upload</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.step} ${bothReady ? styles.stepActive : ""}`}>
              <div className={styles.stepIcon}>3</div>
              <span className={styles.stepLabel}>Style</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.step} ${resultUrl ? styles.stepActive : ""}`}>
              <div className={styles.stepIcon}>4</div>
              <span className={styles.stepLabel}>Magic</span>
            </div>
          </div>

          {/* Persona Studio – Gender, Mannequin, Category */}
          <PersonaStudio
            gender={gender}
            setGender={setGender}
            category={category}
            setCategory={setCategory}
            onMannequinSelect={handleMannequinSelect}
          />

          {/* Upload Section */}
          <section className={styles.uploadSection}>
            <div className={styles.uploadGrid}>
              <ImageUpload
                label="Your Photo"
                description="Clear front-facing photo (or use mannequin above)"
                icon="👤"
                externalPreview={userImage}
                onImageSelect={handleUserImage}
              />

              <ImageUpload
                label="The Outfit"
                description={category === 'top' ? 'Upload a top/shirt' : category === 'bottom' ? 'Upload pants/skirt' : 'Upload a full outfit/dress'}
                icon={category === 'top' ? '👕' : category === 'bottom' ? '👖' : '👗'}
                externalPreview={outfitImage}
                onImageSelect={handleOutfitImage}
              />
            </div>

            {/* Quick Try Presets */}
            <div className={styles.presetsContainer}>
              <div className={styles.presetsHeader}>
                <h4 className={styles.presetsTitle}>Quick Try Catalog</h4>
                <span className={styles.presetsBadge}>New</span>
              </div>
              <div className={styles.presetsList}>
                {QUICK_PRESETS.map((preset) => (
                  <div 
                    key={preset.id} 
                    className={styles.presetCard}
                    onClick={() => {
                      setCategory(preset.category);
                      setOutfitImage(preset.url);
                    }}
                  >
                    <img src={preset.url} alt={preset.name} className={styles.presetImg} />
                    <div className={styles.presetOverlay}>
                      <span className={styles.presetLabel}>{preset.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Quality Toggle */}
            <div className={styles.modeSelectContainer}>
              <button 
                className={`${styles.modeToggleBtn} ${generationMode === 'fast' ? styles.modeToggleActive : ''}`}
                onClick={() => setGenerationMode('fast')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Fast (1 Credit)
              </button>
              <button 
                className={`${styles.modeToggleBtn} ${generationMode === 'pro' ? styles.modeToggleActive : ''}`}
                onClick={() => setGenerationMode('pro')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                Pro HD (2 Credits)
              </button>
            </div>
          </section>

          <GenerateButton
            onClick={handleGenerate}
            disabled={!bothReady || isLoading}
            isLoading={isLoading}
          />
        </div>

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
