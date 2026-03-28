"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const pathname = usePathname();
  const [credits, setCredits] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Poll for live credits just like old Navbar
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
  }, [session, pathname]);

  const toggleSidebar = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Mobile Top Header (Visible only on small screens < 1024px) */}
      <div className={styles.mobileHeader}>
        <div className={styles.brand}>FitSnap AI</div>
        <div className={styles.mobileActions}>
          <ThemeToggle />
          <button className={styles.hamburger} onClick={toggleSidebar} aria-label="Toggle menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Main Sidebar Layout */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ""}`}>
        <div className={styles.topSection}>
          <div className={styles.logo}>
            FitSnap <span className={styles.logoAccent}>AI</span>
          </div>
        </div>

        <nav className={styles.navLinks}>
          <Link href="/" onClick={() => setMobileOpen(false)} className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Try Outfit
          </Link>
          <Link href="/catalog" onClick={() => setMobileOpen(false)} className={`${styles.link} ${pathname === "/catalog" ? styles.active : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Fashion Catalog
          </Link>
          <Link href="/profile" onClick={() => setMobileOpen(false)} className={`${styles.link} ${pathname === "/profile" ? styles.active : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            My Profile
          </Link>
        </nav>

        <div className={styles.bottomSection}>
          <div className={styles.desktopThemeToggle}>
            <span className={styles.themeLabel}>Theme</span>
            <ThemeToggle />
          </div>

          <div className={styles.authCard}>
            {isLoading ? (
              <div className={styles.loadingSkeleton} />
            ) : session ? (
              <div className={styles.userProfile}>
                <div className={styles.userInfo}>
                  <div className={styles.creditsBadge}>
                    ✨ {credits !== null ? `${credits} Credits` : "..."}
                  </div>
                  <span className={styles.userEmail}>{session.user.email}</span>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => signIn("google")} className={styles.loginBtn}>
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay to catch clicks on mobile */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={toggleSidebar} />
      )}
    </>
  );
}
