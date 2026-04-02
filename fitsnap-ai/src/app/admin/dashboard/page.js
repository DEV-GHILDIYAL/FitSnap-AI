"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.email !== "ghildiyaldev1325@gmail.com") {
      router.push("/");
      return;
    }

    fetchStats();
    fetchUsers();

    // Real-time interval (10 seconds)
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [session, status, router, fetchStats, fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (!confirm(`Are you sure you want to delete user ${userId}? This is permanent.`)) return;
    
    setDeletingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.userId !== userId));
        fetchStats(); // Update counters
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      alert("Error deleting user");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || !session || session.user.email !== "ghildiyaldev1325@gmail.com") {
    return (
      <div className={styles.container}>
        <div className={styles.title}>Verifying Admin Status...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>⚡</span> Admin Command Center
        </h1>
        <button className={styles.refreshBtn} onClick={() => { setLoading(true); fetchUsers(); fetchStats(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Users</div>
          <div className={styles.statValue}>{stats?.totalUsers ?? "..."}</div>
          <div className={styles.statSubtext} style={{ color: "rgba(255,255,255,0.3)" }}>Cumulative Growth</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Admins</div>
          <div className={styles.statValue}>{stats?.totalAdmins ?? "..."}</div>
          <div className={styles.statSubtext} style={{ color: "#a855f7" }}>Platform Moderators</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Now</div>
          <div className={styles.statValue}>{stats?.activeNow ?? "..."}</div>
          <div className={styles.activePulse}>
            <div className={styles.pulseDot} />
            <span className={styles.statSubtext}>Live Heartbeats</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Revenue</div>
          <div className={styles.statValue}>₹{stats?.totalRevenue ?? "..."}</div>
          <div className={styles.statSubtext} style={{ color: "#22c55e" }}>Gross Lifetime Sales</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Model Usage</div>
          <div className={styles.statValue}>{stats?.totalGenerations ?? "..."}</div>
          <div className={styles.statSubtext} style={{ color: "rgba(255,255,255,0.3)" }}>Total Generations</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableTitle}>
          User Management
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>
            Showing {users.length} Records
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Loading Users...</div>
        ) : (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>User / Email</th>
                <th>Role</th>
                <th>Credits</th>
                <th>Revenue</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{user.email}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                      {user.role?.toUpperCase() || 'USER'}
                    </span>
                  </td>
                  <td>⚡ {user.credits || 0}</td>
                  <td style={{ color: (user.totalPaid > 0 ? '#22c55e' : 'inherit') }}>₹{user.totalPaid || 0}</td>
                  <td>
                    {user.lastActive 
                      ? new Date(user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Never'}
                  </td>
                  <td>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDeleteUser(user.userId)}
                      disabled={deletingId === user.userId || user.email === session.user.email}
                    >
                      {deletingId === user.userId ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
