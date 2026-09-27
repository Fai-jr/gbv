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
      className="fixed top-3 right-3 z-50 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 shadow border border-zinc-200 hover:bg-zinc-100"
    >
      X
    </button>
  );
}
