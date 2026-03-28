"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const GENDERS = ["All", "Men", "Women"];
const CATEGORIES = ["Tops", "Bottoms", "Full Body", "Traditional"];

// Massive mock database spanning genders and categories
const CATALOG_ITEMS = [
  // --- MEN: Tops ---
  { id: "m-t1", name: "Men's White Basic Tee", gender: "Men", category: "Tops", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" },
  { id: "m-t2", name: "Men's Vintage Denim Jacket", gender: "Men", category: "Tops", url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop" },
  { id: "m-t3", name: "Men's Urban Black Hoodie", gender: "Men", category: "Tops", url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop" },
  { id: "m-t4", name: "Men's Plaid Flannel Shirt", gender: "Men", category: "Tops", url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop" },
  { id: "m-t5", name: "Men's Tailored Blazer", gender: "Men", category: "Tops", url: "https://images.unsplash.com/photo-1594938291404-5fde188ebcd8?q=80&w=800&auto=format&fit=crop" },
  { id: "m-t6", name: "Men's Heavy Winter Coat", gender: "Men", category: "Tops", url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop" },

  // --- MEN: Bottoms ---
  { id: "m-b1", name: "Men's Classic Blue Jeans", gender: "Men", category: "Bottoms", url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop" },
  { id: "m-b2", name: "Men's Black Trousers", gender: "Men", category: "Bottoms", url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop" },
  { id: "m-b3", name: "Men's Casual Cargo Shorts", gender: "Men", category: "Bottoms", url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop" },
  { id: "m-b4", name: "Men's Chinos Sand", gender: "Men", category: "Bottoms", url: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800&auto=format&fit=crop" },

  // --- MEN: Full Body & Traditional ---
  { id: "m-f1", name: "Men's Navy Business Suit", gender: "Men", category: "Full Body", url: "https://images.unsplash.com/photo-1594938291404-5fde188ebcd8?q=80&w=800&auto=format&fit=crop" },
  { id: "m-f2", name: "Men's Royal Silk Kurta", gender: "Men", category: "Traditional", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop" },
  { id: "m-f3", name: "Men's Formal Tuxedo", gender: "Men", category: "Full Body", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop" },

  // --- WOMEN: Tops ---
  { id: "w-t1", name: "Women's Silk Blouse", gender: "Women", category: "Tops", url: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop" },
  { id: "w-t2", name: "Women's Oversized Sweater", gender: "Women", category: "Tops", url: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800&auto=format&fit=crop" },
  { id: "w-t3", name: "Women's Cropped Jacket", gender: "Women", category: "Tops", url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop" },
  { id: "w-t4", name: "Women's Chic Blazer", gender: "Women", category: "Tops", url: "https://images.unsplash.com/photo-1594938291404-5fde188ebcd8?q=80&w=800&auto=format&fit=crop" },
  { id: "w-t5", name: "Women's Classic White Tee", gender: "Women", category: "Tops", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" },
  { id: "w-t6", name: "Women's Winter Trench", gender: "Women", category: "Tops", url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop" },

  // --- WOMEN: Bottoms ---
  { id: "w-b1", name: "Women's High-Waist Jeans", gender: "Women", category: "Bottoms", url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop" },
  { id: "w-b2", name: "Women's Pleated Midi Skirt", gender: "Women", category: "Bottoms", url: "https://images.unsplash.com/photo-1583496661160-c5a87b7ced12?q=80&w=800&auto=format&fit=crop" },
  { id: "w-b3", name: "Women's Flared Trousers", gender: "Women", category: "Bottoms", url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop" },
  { id: "w-b4", name: "Women's Denim Shorts", gender: "Women", category: "Bottoms", url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop" },

  // --- WOMEN: Full Body & Traditional ---
  { id: "w-f1", name: "Women's Evening Black Dress", gender: "Women", category: "Full Body", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop" },
  { id: "w-f2", name: "Women's Summer Floral Jumpsuit", gender: "Women", category: "Full Body", url: "https://images.unsplash.com/photo-1485231183945-fc4ef547b71d?q=80&w=800&auto=format&fit=crop" },
  { id: "w-f3", name: "Women's Beige Silk Saree", gender: "Women", category: "Traditional", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop" },
  { id: "w-f4", name: "Women's Wedding Lehenga", gender: "Women", category: "Traditional", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop" }, // Shared image ref
  { id: "w-f5", name: "Women's Cotton Kurti", gender: "Women", category: "Traditional", url: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800&auto=format&fit=crop" },
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
                <img src={item.url} alt={item.name} className={styles.image} loading="lazy" />
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
