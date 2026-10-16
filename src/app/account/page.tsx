"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential, signOut } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import { wipeLocalData } from "@/lib/privacy";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { LogOut, Trash2, MessagesSquare, Heart, UserPlus, LogIn, TriangleAlert } from "lucide-react";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return local.slice(0, 1) + "***@" + domain;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLang();
  const [confirming, setConfirming] = useState(false);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const member = !!user && !user.isAnonymous;

  async function leave() {
    try {
      window.localStorage.removeItem("gbvconnect-pseudonym");
    } catch {}
    await signOut(auth);
    router.push("/");
  }

  async function removeAccount(e: React.FormEvent) {
    e.preventDefault();
    const current = auth.currentUser;
    if (!current || !current.email) return;
    setError("");
    setBusy(true);
    try {
      await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, pw));
    } catch {
      setError(t("That password is not correct."));
      setBusy(false);
      return;
    }
    try {
      const stories = await getDocs(query(collection(db, "stories"), where("authorUid", "==", current.uid)));
      await Promise.all(stories.docs.map((d) => deleteDoc(d.ref)));
      const groups = await getDocs(
        query(collection(db, "groups"), where("creatorUid", "==", current.uid), where("status", "==", "pending"))
      );
      await Promise.all(groups.docs.map((d) => deleteDoc(d.ref)));
      await deleteDoc(doc(db, "memberProfiles", current.uid));
      await deleteUser(current);
      await wipeLocalData("/");
    } catch (err) {
      console.error("Account deletion failed:", err);
      setError(t("Could not delete the account. Please try again."));
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader active="" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[640px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <h1 className="text-3xl font-semibold text-primary">{t("My account")}</h1>

          {loading && <p className="text-on-surface-variant">{t("Loading...")}</p>}

          {!loading && !member && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <p className="text-on-surface-variant">{t("You are not signed in to an account.")}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/account/register" className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
                  <UserPlus size={18} />
                  {t("Create an account")}
                </Link>
                <Link href="/account/login" className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                  <LogIn size={18} />
                  {t("Sign in")}
                </Link>
              </div>
            </div>
          )}

          {!loading && member && user && (
            <>
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <div>
                  {user.email && (
                    <p className="text-sm text-on-surface-variant mt-1">{t("Signed in as {email}", { email: maskEmail(user.email) })}</p>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t("You are using the private chat and the community under made-up names. Your email and name are never shown there.")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/community" className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
                    <MessagesSquare size={18} />
                    {t("Go to the community")}
                  </Link>
                  <Link href="/support/chat" className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                    <Heart size={18} />
                    {t("Open the private chat")}
                  </Link>
                </div>
                <button onClick={leave} className="inline-flex items-center justify-center gap-2 h-[48px] rounded-xl bg-surface-container-highest text-primary font-semibold hover:bg-surface-container-high transition-colors">
                  <LogOut size={18} />
                  {t("Sign out")}
                </button>
              </div>

              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-primary">{t("Delete my account")}</h2>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-notice-bg text-notice-text text-sm">
                  <TriangleAlert size={18} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {t("This permanently deletes your account and the stories you wrote. Groups you started that a moderator already approved, and messages you wrote in live rooms, stay under your made-up name until a moderator removes them.")}
                  </span>
                </div>
                {!confirming ? (
                  <button onClick={() => setConfirming(true)} className="inline-flex items-center justify-center gap-2 h-[48px] rounded-xl bg-full-bg text-full-text font-semibold hover:opacity-80 transition-opacity">
                    <Trash2 size={18} />
                    {t("Delete my account")}
                  </button>
                ) : (
                  <form onSubmit={removeAccount} className="flex flex-col gap-3">
                    <label htmlFor="del-pass" className="text-sm font-semibold text-on-surface">{t("Type your password to confirm")}</label>
                    <input
                      id="del-pass"
                      type="password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="w-full h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                    {error && <p className="text-sm text-error font-semibold">{error}</p>}
                    <div className="flex gap-3">
                      <button type="submit" disabled={busy} className="flex-1 h-[48px] rounded-xl bg-full-bg text-full-text font-semibold hover:opacity-80 transition-opacity disabled:opacity-60">
                        {t("Delete everything")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirming(false);
                          setPw("");
                          setError("");
                        }}
                        className="px-5 h-[48px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors"
                      >
                        {t("Cancel")}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
