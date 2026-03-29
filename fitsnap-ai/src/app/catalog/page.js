"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

const GENDERS = ["All", "Men", "Women"];
const CATEGORIES = ["Tops", "Bottoms", "Full Body", "Traditional"];

// Massive mock database spanning genders and categories
const CATALOG_ITEMS = [
  // --- MEN: Tops ---
  { id: "m1", name: "Men's Casual Shirt", gender: "Men", category: "Tops", url: "/catalog/casual-shirt.png" },
  { id: "m2", name: "Men's Blazer", gender: "Men", category: "Tops", url: "/catalog/blazer.png" },
  { id: "m4", name: "Men's Hoodie", gender: "Men", category: "Tops", url: "/catalog/hoodie.png" },
  { id: "m-t4", name: "Men's Kurta", gender: "Men", category: "Traditional", url: "/catalog/kurta.png" },

  // --- WOMEN: Tops ---
  { id: "w-t1", name: "Women's Casual Top", gender: "Women", category: "Tops", url: "/catalog/casual-shirt.png" },
  { id: "w-t2", name: "Women's Comfort Hoodie", gender: "Women", category: "Tops", url: "/catalog/hoodie.png" },
  
  // --- WOMEN: Traditional & Full Body ---
  { id: "w-f3", name: "Women's Silk Saree Look", gender: "Women", category: "Traditional", url: "/catalog/kurta.png" },
  { id: "w-f4", name: "Women's Evening Blazer", gender: "Women", category: "Full Body", url: "/catalog/blazer.png" }, 
];

export default function CatalogPage() {
  const [activeGender, setActiveGender] = useState("All");
  const [activeCategory, setActiveCategory] = useState("Tops");
  const router = useRouter();

  // Filter the catalog items instantly based on dual-state
  const filteredCatalog = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      const matchGender = activeGender === "All" || item.gender === activeGender;
      const matchCategory = item.category === activeCategory;
      return matchGender && matchCategory;
    });
  }, [activeGender, activeCategory]);

  const handleTryOn = (url) => {
    router.push(`/?outfitUrl=${encodeURIComponent(url)}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Fashion Catalog</h1>
        <p className={styles.subtitle}>
          Browse over 25+ premium outfits across Men & Women collections. Try them on instantly.
        </p>
      </div>

      <div className={styles.filtersWrapper}>
        {/* Gender Pills */}
        <div className={styles.pillContainer}>
          {GENDERS.map((gender) => (
            <button
              key={gender}
              onClick={() => setActiveGender(gender)}
              className={`${styles.pillBtn} ${activeGender === gender ? styles.activePill : ""}`}
            >
              {gender}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className={styles.tabsContainer}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.tabBtn} ${activeCategory === cat ? styles.activeTab : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredCatalog.length > 0 ? (
        <div className={styles.catalogGrid}>
          {filteredCatalog.map((item) => (
            <div key={item.id} className={styles.catalogCard}>
              <div className={styles.imageWrapper}>
                <Image 
                  src={item.url} 
                  alt={item.name} 
                  className={styles.image} 
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={item.id.startsWith('m')} 
                />
                <div className={styles.overlay}>
                  <button className={styles.tryBtn} onClick={() => handleTryOn(item.url)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Try This
                  </button>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <div className={styles.badgesWrapper}>
                  <span className={styles.badge}>{item.gender}</span>
                  <span className={styles.badgeLabel}>{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No outfits found for this combination.</p>
        </div>
      )}
    </div>
  );
}
