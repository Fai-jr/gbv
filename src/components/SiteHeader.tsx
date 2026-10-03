"use client";

import Link from "next/link";
import { Shield, User, Lock } from "lucide-react";
import { safeExit } from "@/components/QuickExit";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Directory", href: "/contacts" },
  { label: "Refuge", href: "/refuge" },
  { label: "Emergency", href: "/help" },
  { label: "Chat", href: "/support/chat" },
  { label: "Market", href: "/marketplace" },
  { label: "Rights", href: "/rights" },
  { label: "For friends", href: "/help-someone" },
];

export default function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(74,59,82,0.06)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-10 flex flex-col justify-between py-1">
        <div className="flex items-center justify-between gap-4 pt-1">
          <Link href="/" className="flex items-center gap-3">
            <img alt="GBVConnect logo" className="h-8 w-auto" src="/logo.svg" />
          </Link>
          <div className="flex items-center gap-3">
<button type="button" onClick={safeExit} title="If someone might check your browsing history, use private/incognito browsing for full protection." className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high font-semibold text-sm transition-colors">
              <Shield size={16} className="text-tertiary" />
              <span className="hidden sm:inline">Quick Exit</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User size={16} className="text-on-primary" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pb-1 overflow-x-auto">
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "px-3 py-1 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors " +
                  (active === item.href
                    ? "bg-primary-container text-on-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container")
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center">
            <Link
              href="/staff/login"
              className="text-sm font-semibold text-primary hover:text-on-primary-fixed-variant underline decoration-primary-container decoration-2 underline-offset-4"
            >
              Staff &amp; Admin Portal &rarr;
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-surface-container-high py-1 px-4 text-center">
        <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-2 text-xs text-on-surface-variant">
          <Lock size={14} className="text-tertiary" />
          <span>You are safe here. Private, confidential, verified support across Cameroon.</span>
        </div>
      </div>
    </header>
  );
}
