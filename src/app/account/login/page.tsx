"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLang } from "@/lib/i18n";
import { nextPath } from "@/lib/nav";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Mail, KeyRound, Eye, EyeOff, LogIn } from "lucide-react";

const fieldClass =
  "w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 border border-border-soft focus:outline-none focus:ring-2 focus:ring-primary-container";

export default function AccountLoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await setPersistence(auth, shared ? browserSessionPersistence : browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push(nextPath("/account"));
    } catch (err: any) {
      if (err?.code === "auth/too-many-requests") {
        setError(t("Too many attempts. Please wait a few minutes and try again."));
      } else {
        setError(t("Wrong email or password."));
      }
      setBusy(false);
    }
  }

  async function reset() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError(t("Enter your email address first, then choose Forgot password."));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // The same message is shown either way, so this page never reveals which emails have accounts.
    }
    setInfo(t("If an account exists for this email, a reset link has been sent."));
  }

  return (
    <>
      <SiteHeader active="" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[520px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-primary">{t("Sign in to your account")}</h1>
            <p className="text-on-surface-variant mt-1">
              {t("Welcome back. Sign in to use the private chat and the community.")}
            </p>
          </div>

          <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="l-email" className="text-sm font-semibold text-on-surface">{t("Email address")}</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input id="l-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required className={fieldClass} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="l-pass" className="text-sm font-semibold text-on-surface">{t("Password")}</label>
                <button type="button" onClick={reset} className="text-sm font-semibold text-primary hover:underline">
                  {t("Forgot password?")}
                </button>
              </div>
              <div className="relative">
                <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input id="l-pass" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className={fieldClass + " pr-12"} />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide" : "Show"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-primary"
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
              <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} className="mt-1 w-5 h-5 accent-[#4A3B52]" />
              <span className="text-sm text-on-surface">{t("This is a shared device. Do not keep me signed in.")}</span>
            </label>

            {error && <p className="text-sm text-error font-semibold">{error}</p>}
            {info && <p className="text-sm text-available-text font-semibold">{info}</p>}

            <button type="submit" disabled={busy} className="h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-colors shadow-sm disabled:opacity-60">
              <LogIn size={18} />
              {busy ? t("Signing in...") : t("Sign in")}
            </button>
          </form>

          <p className="text-sm text-on-surface-variant text-center">
            {t("No account yet?")}{" "}
            <Link href="/account/register" className="font-semibold text-primary underline decoration-tertiary">{t("Create one")}</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
