"use client";

import Link from "next/link";
import ClearDataButton from "@/components/ClearDataButton";
import { useLang } from "@/lib/i18n";

export default function SiteFooter() {
  const { t } = useLang();

  return (
    <footer className="w-full bg-surface-container py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant text-sm">
        <div>{t("© 2026 GBVConnect Cameroon • Humanitarian & Survivor Sanctuary Network")}</div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold">
          <Link href="/feedback" className="hover:text-on-surface transition-colors">
            {t("Give feedback")}
          </Link>
          <ClearDataButton />
        </div>
      </div>
    </footer>
  );
}
