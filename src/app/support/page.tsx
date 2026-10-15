"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/lib/i18n";
import { Phone, ArrowRight, Home as HomeIcon, TriangleAlert } from "lucide-react";

export default function SupportPage() {
  const { t } = useLang();
  const [danger, setDanger] = useState(false);

  return (
    <>
      <SiteHeader active="/support" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[640px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-primary">{t("Before we talk")}</h1>
            <p className="text-on-surface-variant mt-1">
              {t("A quick question first, so we can point you to the right place.")}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-5">
            <h2 className="text-xl font-semibold text-primary">{t("Are you in immediate danger right now?")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDanger(true)}
                className="h-[56px] rounded-xl bg-secondary text-on-secondary font-semibold hover:bg-on-secondary-fixed-variant transition-colors"
              >
                {t("Yes, I am in danger")}
              </button>
              <Link
                href="/support/chat"
                className="h-[56px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2"
              >
                {t("No, I would like to talk")}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {danger && (
            <div className="bg-notice-bg text-notice-text rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <TriangleAlert size={24} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xl font-bold">{t("Please call 116 now")}</p>
                  <p className="mt-1 leading-relaxed">
                    {t("Call 116 now. It is free, and it is the fastest real way to reach help. If you cannot talk, move somewhere safe if you can.")}
                  </p>
                </div>
              </div>
              <a href="tel:116" className="inline-flex items-center justify-center gap-2 h-[56px] rounded-xl bg-secondary text-on-secondary font-semibold hover:bg-on-secondary-fixed-variant transition-colors">
                <Phone size={20} />
                {t("Call 116")}
              </a>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/help" className="inline-flex items-center justify-center gap-2 h-[48px] rounded-xl bg-surface-container-lowest text-primary font-semibold hover:bg-surface-container transition-colors">
                  <TriangleAlert size={18} />
                  {t("Open the alert page")}
                </Link>
                <Link href="/refuge" className="inline-flex items-center justify-center gap-2 h-[48px] rounded-xl bg-surface-container-lowest text-primary font-semibold hover:bg-surface-container transition-colors">
                  <HomeIcon size={18} />
                  {t("Find a safe place")}
                </Link>
              </div>
              <Link href="/support/chat" className="text-sm font-semibold underline text-center">
                {t("Continue to the chat")}
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
