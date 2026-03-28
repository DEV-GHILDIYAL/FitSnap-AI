"use client";

import { useState } from "react";
import styles from "./PresetOutfits.module.css";

const PRESETS = [
  { id: "casual", name: "Casual T-Shirt", path: "/presets/casual.png" },
  { id: "formal", name: "Formal Blazer", path: "/presets/formal.png" },
  { id: "kurta", name: "Indian Kurta", path: "/presets/kurta.png" },
  { id: "hoodie", name: "Comfy Hoodie", path: "/presets/hoodie.png" },
];

export default function PresetOutfits({ onSelect }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleSelect = async (preset) => {
    setLoadingId(preset.id);
    try {
      // Fetch the image and convert it to a base64 data URL so it works seamlessly 
      // with the existing API logic which expects a base64 string.
      const response = await fetch(preset.path);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Create a mock File object to satisfy ImageUpload's state if needed
        const file = new File([blob], `${preset.id}.png`, { type: blob.type });
        onSelect(file, reader.result);
        setLoadingId(null);
      };
      
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load preset image", err);
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>✨ Try Popular Outfits</h3>
      <div className={styles.grid}>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={styles.card}
            onClick={() => handleSelect(preset)}
            disabled={loadingId !== null}
            aria-label={`Select ${preset.name}`}
          >
            <div className={styles.imageContainer}>
              <img src={preset.path} alt={preset.name} className={styles.image} />
              {loadingId === preset.id && (
                <div className={styles.loadingOverlay}>
                  <span className={styles.spinner} />
                </div>
              )}
            </div>
            <span className={styles.label}>{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
