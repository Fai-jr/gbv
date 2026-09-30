"use client";

import { useEffect, useRef } from "react";
import { LogOut } from "lucide-react";

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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">
      <button
        onClick={exitNow}
        title="If someone might check your browsing history, use private/incognito browsing for full protection."
        className="group flex items-center gap-3 px-6 py-2.5 bg-secondary text-on-secondary rounded-full shadow-[0_12px_32px_-4px_rgba(74,59,82,0.24)] hover:bg-on-secondary-fixed-variant transition-all"
      >
        <LogOut size={20} />
        <span className="flex flex-col text-left leading-tight">
          <span className="text-sm font-semibold">Quick Exit (Esc x3)</span>
          <span className="text-xs opacity-90">Immediate redirect</span>
        </span>
      </button>
    </div>
  );
}
