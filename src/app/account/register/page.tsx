"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  linkWithCredential,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useLang } from "@/lib/i18n";
import { nextPath } from "@/lib/nav";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Mail, KeyRound, Eye, EyeOff, ShieldCheck, Lock, User } from "lucide-react";

const fieldClass =
  "w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 border border-border-soft focus:outline-none focus:ring-2 focus:ring-primary-container";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [adult, setAdult] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!first.trim() || !last.trim()) return setError(t("Please enter your first and last name."));
    if (!adult) return setError(t("Please confirm that you are 18 or older."));
    if (password.length < 8) return setError(t("Please choose a password of at least 8 characters."));
    if (password !== confirm) return setError(t("The two passwords do not match."));

    setBusy(true);
    try {
      await setPersistence(auth, shared ? browserSessionPersistence : browserLocalPersistence);
      const current = auth.currentUser;
      if (!current || !current.isAnonymous) {
        setError(t("You are already signed in. Please sign out first."));
        setBusy(false);
        return;
      }
      const userRef = doc(db, "users", current.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) await setDoc(userRef, { role: "survivor", createdAt: new Date().toISOString() });

      const cleanEmail = email.trim();
      await linkWithCredential(current, EmailAuthProvider.credential(cleanEmail, password));
      const signedIn = await signInWithEmailAndPassword(auth, cleanEmail, password);

      try {
        await setDoc(doc(db, "memberProfiles", signedIn.user.uid), {
          firstName: first.trim(),
          lastName: last.trim(),
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Could not save the name:", err);
      }
      router.push(nextPath("/account"));
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/email-already-in-use" || code === "auth/credential-already-in-use") {
        setError(t("An account with this email already exists. Try signing in instead."));
      } else if (code === "auth/weak-password") {
        setError(t("Please choose a stronger password."));
      } else if (code === "auth/invalid-email") {
        setError(t("That email address does not look right."));
      } else {
        setError(t("Could not create the account. Please try again."));
      }
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader active="" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[640px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-primary">{t("Create a secure account")}</h1>
            <p className="text-on-surface-variant mt-1">
              {t("Members can use the private chat and the community. In both, you appear only under a made-up name.")}
            </p>
          </div>

          <div className="bg-surface-container rounded-xl p-5 flex items-start gap-3">
            <ShieldCheck size={22} className="text-tertiary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-primary">{t("About your privacy")}</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t("Your email and password are stored securely so you can sign in again. Other members never see your email or name: you always appear under a made-up name.")}
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t("Your first and last name are stored separately and are not shown anywhere on this site. Administrators and staff can look them up only when it is necessary to protect someone, for example to help a person who may be in danger. Each lookup is recorded.")}
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t("The technical administrators of the system could in principle connect an account to what it posted, so please never include details that identify you in what you write.")}
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t("Use an email address that only you can open. We never send you anything except a password reset when you ask for one.")}
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="r-first" className="text-sm font-semibold text-on-surface">{t("First name")}</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input id="r-first" value={first} onChange={(e) => setFirst(e.target.value)} maxLength={60} autoComplete="given-name" required className={fieldClass} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="r-last" className="text-sm font-semibold text-on-surface">{t("Last name")}</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input id="r-last" value={last} onChange={(e) => setLast(e.target.value)} maxLength={60} autoComplete="family-name" required className={fieldClass} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="r-email" className="text-sm font-semibold text-on-surface">{t("Email address")}</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className={fieldClass} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="r-pass" className="text-sm font-semibold text-on-surface">{t("Password")}</label>
              <div className="relative">
                <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="r-pass"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("At least 8 characters")}
                  autoComplete="new-password"
                  required
                  className={fieldClass + " pr-12"}
                />
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="r-confirm" className="text-sm font-semibold text-on-surface">{t("Confirm password")}</label>
              <div className="relative">
                <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input id="r-confirm" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required className={fieldClass} />
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-1 w-5 h-5 accent-[#4A3B52]" />
              <span className="text-sm text-on-surface">{t("I am 18 or older.")}</span>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
              <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} className="mt-1 w-5 h-5 accent-[#4A3B52]" />
              <span className="text-sm text-on-surface">{t("This is a shared device. Do not keep me signed in.")}</span>
            </label>

            {error && <p className="text-sm text-error font-semibold">{error}</p>}

            <button type="submit" disabled={busy} className="h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-colors shadow-sm disabled:opacity-60">
              <Lock size={18} />
              {busy ? t("Creating your account...") : t("Create my account")}
            </button>
          </form>

          <p className="text-sm text-on-surface-variant text-center">
            {t("Already have an account?")}{" "}
            <Link href="/account/login" className="font-semibold text-primary underline decoration-tertiary">{t("Sign in")}</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
