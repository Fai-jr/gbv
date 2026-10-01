"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  TriangleAlert,
  VolumeX,
  MapPin,
  CheckCircle2,
  Phone,
  RotateCcw,
} from "lucide-react";

export default function HelpPage() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleAlert() {
    if (!user) return;
    setStatus("sending");
    try {
      await addDoc(collection(db, "alerts"), {
        triggeredBy: user.uid,
        timestamp: serverTimestamp(),
        status: "sent",
      });
      setStatus("sent");
    } catch (err) {
      console.error("Failed to send alert:", err);
      setStatus("error");
    }
  }

  return (
    <>
      <SiteHeader active="/help" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 bg-surface-container-high px-4 py-1.5 rounded-full text-on-surface-variant text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
              <span>Discreet &amp; Silent &mdash; your device will not sound or vibrate</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-[0_4px_24px_rgba(74,59,82,0.05)]">
                <div className="flex items-start gap-4 mb-2">
                  <TriangleAlert size={32} className="text-primary shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                      Sanctuary Protocol &bull; GBVConnect
                    </span>
                    <h1 className="text-3xl font-semibold text-primary leading-tight">
                      Immediate Assistance
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-on-surface-variant mt-3 leading-relaxed">
                  If you are in immediate physical danger, please call <strong className="text-primary">116</strong>{" "}
                  (toll-free, 24/7) right now. The button below quietly records that you needed help, with no
                  sound and no visible confirmation screen &mdash; it does not call anyone on its own.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center p-8 bg-surface-container-low rounded-xl text-center">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-secondary opacity-25 rounded-full blur-md group-hover:opacity-40 transition-opacity" />
                    <button
                      onClick={handleAlert}
                      disabled={authLoading || status === "sending" || status === "sent"}
                      className="relative flex items-center justify-center gap-3 px-8 py-5 bg-secondary hover:bg-on-secondary-fixed-variant active:scale-[0.98] text-on-secondary font-semibold rounded-full shadow-[0_12px_28px_rgba(180,39,31,0.32)] transition-all disabled:opacity-60"
                    >
                      <TriangleAlert size={26} />
                      <span className="font-bold tracking-tight">
                        {status === "sending" ? "Recording..." : "I need help now"}
                      </span>
                    </button>
                  </div>
                  <div className="mt-5 flex items-center justify-center gap-4 text-on-surface-variant text-sm">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-tertiary" />
                      No location is sent from this app
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5">
                      <VolumeX size={16} className="text-tertiary" />
                      Silent, no vibration
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="tel:116"
                className="bg-secondary text-on-secondary p-5 rounded-xl flex items-center gap-4 hover:bg-on-secondary-fixed-variant transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-on-secondary/15 flex items-center justify-center shrink-0">
                  <Phone size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Call the National GBV Helpline: 116</span>
                  <p className="text-sm opacity-90 mt-0.5">
                    Toll-free, 24/7, free on MTN, Orange, and Camtel. This is the fastest real way to reach help.
                  </p>
                </div>
              </a>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-[0_4px_24px_rgba(74,59,82,0.05)]">
                {status !== "sent" ? (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-4">
                      <TriangleAlert size={26} className="text-tertiary" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary">Nothing recorded yet</h3>
                    <p className="text-sm text-on-surface-variant max-w-xs mt-1">
                      Tapping the button only records that you needed help, for your own records. It does not
                      alert anyone automatically.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase font-bold text-on-surface-variant">Recorded</span>
                        <span className="text-lg font-semibold text-primary leading-tight">
                          Your alert has been saved.
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-surface-container-low rounded-xl flex flex-col gap-1">
                      <span className="text-sm text-primary font-bold">What this means</span>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        This records that you needed help right now. It is not monitored live and does not
                        contact anyone by itself. If you are in danger, please call 116 directly.
                      </p>
                    </div>

                    <div className="p-4 bg-surface-container-lowest border border-border-soft rounded-xl flex flex-col gap-2">
                      <span className="text-sm text-primary font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-tertiary" />
                        Recommended immediate steps
                      </span>
                      <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0 mt-2" />
                          <span>Move to an interior room with a lock or an exit route if you can.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0 mt-2" />
                          <span>Lower your screen brightness or lock your phone; keep audio muted.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0 mt-2" />
                          <span>Call 116 directly when it is safe to do so.</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => setStatus("idle")}
                      className="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-primary font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Reset
                    </button>
                  </div>
                )}
                {status === "error" && (
                  <p className="text-sm text-error mt-3">
                    Something went wrong saving this. Please call 116 directly.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
