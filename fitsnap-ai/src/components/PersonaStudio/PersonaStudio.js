"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./PersonaStudio.module.css";

const CATEGORIES = [
  { id: "top", label: "Top", icon: "👕", desc: "T-shirts, Shirts, Jackets" },
  { id: "bottom", label: "Bottom", icon: "👖", desc: "Pants, Skirts, Jeans", warning: "Use full-length lower body shots" },
  { id: "full", label: "Full Body", icon: "👗", desc: "Dresses, Suits, Jumpsuits" },
];

export default function PersonaStudio({ gender, setGender, category, setCategory, onMannequinSelect }) {
  const mannequinSrc = gender === "male" ? "/mannequins/male.png" : "/mannequins/female.png";

  const handleUseMannequin = () => {
    // Convert mannequin image to base64 to use as persona
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      onMannequinSelect?.(dataUrl);
    };
    img.src = mannequinSrc;
  };

  return (
    <div className={styles.studioPanel}>
      {/* Section Title */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>🎭</span>
        <div>
          <h3 className={styles.sectionTitle}>Persona Studio</h3>
          <p className={styles.sectionDesc}>Choose your style profile</p>
        </div>
      </div>

      {/* Gender Selection */}
      <div className={styles.genderRow}>
        <button
          className={`${styles.genderCard} ${gender === "male" ? styles.genderActive : ""}`}
          onClick={() => setGender("male")}
          aria-label="Select Male"
        >
          <span className={styles.genderEmoji}>👨</span>
          <span className={styles.genderLabel}>Male</span>
        </button>
        <button
          className={`${styles.genderCard} ${gender === "female" ? styles.genderActive : ""}`}
          onClick={() => setGender("female")}
          aria-label="Select Female"
        >
          <span className={styles.genderEmoji}>👩</span>
          <span className={styles.genderLabel}>Female</span>
        </button>
      </div>

      {/* Visual Persona Feedback */}
      <div className={styles.personaPreview}>
        <div className={styles.avatarCircle}>
          <span className={styles.avatarEmoji}>{gender === "male" ? "🤵" : "💃"}</span>
          <div className={styles.pulseRing}></div>
        </div>
        <div className={styles.personaInfo}>
          <p className={styles.personaStatus}>Profile Active</p>
          <h4 className={styles.personaName}>{gender === 'male' ? 'Elite Male Styling' : 'Elite Female Styling'}</h4>
        </div>
      </div>

      {/* Category Selection */}
      <div className={styles.categorySection}>
        <p className={styles.categoryTitle}>What are you trying on?</p>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryCard} ${category === cat.id ? styles.categoryActive : ""}`}
              onClick={() => setCategory(cat.id)}
              aria-label={`Select ${cat.label}`}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryLabel}>{cat.label}</span>
              <span className={styles.categoryDesc}>{cat.desc}</span>
              {cat.warning && category === cat.id && (
                <span className={styles.categoryWarning}>⚠️ {cat.warning}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Mannequin (Optional) */}
      <div className={styles.mannequinFooter}>
        <button className={styles.useMannequinBtn} onClick={handleUseMannequin}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Quick Mannequin Persona
        </button>
      </div>
    </div>
  );
}
