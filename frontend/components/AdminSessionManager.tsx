"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminSessionManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we are currently in admin path
    const isAdminPath = pathname?.startsWith("/admin");

    // Check if we were previously in admin (persist across refreshes via sessionStorage)
    const wasInAdmin = sessionStorage.getItem("wasInAdmin") === "true";

    if (isAdminPath) {
      // We are in admin, ensure flag is set
      // We can also exclude /admin/login if we strictly only want to track "authenticated" sessions,
      // but triggering logout when leaving the login page is also harmless/safer.
      if (!wasInAdmin) {
        sessionStorage.setItem("wasInAdmin", "true");
      }
    } else {
      // We are NOT in admin path
      if (wasInAdmin) {
        // We just left admin path!
        console.log("Leaving admin area, auto-logging out...");

        // Clear flag
        sessionStorage.removeItem("wasInAdmin");

        // Trigger logout
        // We use keepalive: true if supported or just standard fetch
        // Since we are navigating away, beacon or keepalive is better reliable, but standard fetch usually works in modern browsers for short requests
        fetch("/api/admin/logout", {
          method: "POST",
          keepalive: true, // Important for requests when page is unloading/changing
        }).catch((err) => console.error("Auto-logout failed", err));
      }
    }
  }, [pathname]);

  return null;
}
