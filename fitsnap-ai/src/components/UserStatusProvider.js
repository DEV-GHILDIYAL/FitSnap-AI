"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function UserStatusProvider() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    // Send initial heartbeat
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/user/heartbeat", { method: "POST" });
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    };

    sendHeartbeat();

    // Set up 2-minute interval (120,000 ms)
    const interval = setInterval(sendHeartbeat, 120000);

    return () => clearInterval(interval);
  }, [session]);

  return null;
}
