"use client";

import { useEffect, useRef } from "react";

const EXIT_URL = "https://www.google.com";

export default function QuickExit() {
  const escCountRef = useRef(0);
  const escTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function exitNow() {
    for (let i = 0; i < 20; i++) {
      window.history.pushState(null, "", "/");
    }
    window.location.replace(EXIT_URL);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      escCountRef.current += 1;

      if (escTimerRef.current) clearTimeout(escTimerRef.current);
      escTimerRef.current = setTimeout(() => {
        escCountRef.current = 0;
      }, 1500);

      if (escCountRef.current >= 3) {
        exitNow();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <button
      onClick={exitNow}
      aria-label="Quick exit"
      title="If someone might check your browsing history, use private/incognito browsing for full protection."
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center border-t border-border-soft bg-card py-3 text-sm font-medium text-muted hover:bg-tint"
    >
      Close
    </button>
  );
}
