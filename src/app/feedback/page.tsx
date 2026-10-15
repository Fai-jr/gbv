"use client";

import { useState } from "react";
import Link from "next/link";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CheckCircle2, Lock } from "lucide-react";

function YesNo({
  question,
  value,
  onChange,
}: {
  question: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const { t } = useLang();
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-lg font-semibold text-primary">{t(question)}</legend>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={
              "h-[52px] rounded-xl font-semibold transition-colors " +
              (value === opt
                ? "bg-primary-container text-on-primary"
                : "bg-surface-container text-primary hover:bg-surface-container-high")
            }
          >
            {opt ? t("Yes") : t("No")}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function FeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const [reached, setReached] = useState<boolean | null>(null);
  const [helped, setHelped] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || reached === null || helped === null) return;
    setStatus("sending");
    try {
      await addDoc(collection(db, "feedback"), {
        reachedService: reached,
        wasHelped: helped,
        timestamp: serverTimestamp(),
      });
      setStatus("done");
    } catch (err) {
      console.error("Feedback failed:", err);
      setStatus("error");
    }
  }

  return (
    <>
      <SiteHeader active="" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[640px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-primary">{t("Your feedback")}</h1>
            <p className="text-on-surface-variant mt-1">
              {t("Two quick questions. They are anonymous: no name, no account and no location is saved.")}
            </p>
          </div>

          {status === "done" ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-8 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-available-bg text-available-text flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <p className="text-lg text-primary font-semibold">{t("Thank you. Your answers help us keep the directory useful.")}</p>
              <Link href="/" className="inline-flex items-center justify-center px-6 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
                {t("Back to the home page")}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6">
              <YesNo question="Did you manage to reach the contact?" value={reached} onChange={setReached} />
              <YesNo question="Were you helped?" value={helped} onChange={setHelped} />
              <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                <Lock size={14} className="text-tertiary shrink-0 mt-0.5" />
                <span>{t("Two quick questions. They are anonymous: no name, no account and no location is saved.")}</span>
              </div>
              {status === "error" && <p className="text-sm text-error font-semibold">{t("Could not send your feedback. Please try again.")}</p>}
              <button
                type="submit"
                disabled={authLoading || !user || reached === null || helped === null || status === "sending"}
                className="h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
              >
                {status === "sending" ? t("Sending...") : t("Send feedback")}
              </button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
