"use client";

import { useEffect, useRef } from "react";

const EXIT_URL = "https://www.google.com";

export function safeExit() {
  for (let i = 0; i < 20; i++) {
    window.history.pushState(null, "", "/");
  }
  window.location.replace(EXIT_URL);
}

export default function QuickExit() {
  const escCountRef = useRef(0);
  const escTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      escCountRef.current += 1;

      if (escTimerRef.current) clearTimeout(escTimerRef.current);
      escTimerRef.current = setTimeout(() => {
        escCountRef.current = 0;
      }, 1500);

      if (escCountRef.current >= 3) {
        safeExit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
