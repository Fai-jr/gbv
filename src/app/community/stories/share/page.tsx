"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import { usePseudonym } from "@/lib/usePseudonym";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { STORY_TOPICS, TOPIC_LABEL, checkContent } from "@/lib/community";
import { ShieldAlert, RefreshCw, Trash2, CheckCircle2 } from "lucide-react";

type Mine = { id: string; title: string; topic: string; status: string; createdAt?: { seconds: number } };

const STATUS_LABEL: Record<string, { text: string; style: string }> = {
  pending: { text: "Waiting for a moderator", style: "bg-notice-bg text-notice-text" },
  published: { text: "Published", style: "bg-available-bg text-available-text" },
  rejected: { text: "Not published", style: "bg-surface-container-high text-on-surface-variant" },
};

const inputClass =
  "w-full h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

export default function ShareStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const [pseudonym, newPseudonym] = usePseudonym();
  const [topic, setTopic] = useState(STORY_TOPICS[0].key);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [mine, setMine] = useState<Mine[]>([]);

  async function loadMine() {
    if (!user) return;
    try {
      const snap = await getDocs(query(collection(db, "stories"), where("authorUid", "==", user.uid)));
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Mine, "id">) }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setMine(list);
    } catch (err) {
      console.error("Failed to load your stories:", err);
    }
  }

  useEffect(() => {
    if (!authLoading && user) loadMine();
  }, [authLoading, user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSent(false);
    const problem = checkContent(title, 100, 1, t) || checkContent(body, 4000, 20, t);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "stories"), {
        title: title.trim(),
        body: body.trim(),
        topic,
        pseudonym,
        authorUid: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setBody("");
      setAgree(false);
      setSent(true);
      await loadMine();
    } catch (err) {
      console.error("Failed to submit story:", err);
      setError(t("Your story could not be sent. Please try again in a moment."));
    }
    setSaving(false);
  }

  async function withdraw(s: Mine) {
    if (!window.confirm(t("Take down \"{name}\"? This cannot be undone.", { name: s.title }))) return;
    try {
      await deleteDoc(doc(db, "stories", s.id));
      setMine((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      console.error("Failed to withdraw:", err);
      setError(t("Could not take that down. Please try again."));
    }
  }

  return (
    <>
      <SiteHeader active="/community" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[760px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div>
            <Link href="/community/stories" className="text-sm font-semibold text-primary hover:underline">{t("Back to stories")}</Link>
            <h1 className="text-3xl font-semibold text-primary mt-1">{t("Share your story")}</h1>
            <p className="text-on-surface-variant mt-1">{t("Your words may help someone feel less alone. You decide how much to say.")}</p>
          </div>

          {sent && (
            <div className="rounded-xl bg-available-bg text-available-text p-4 flex items-start gap-3">
              <CheckCircle2 size={22} className="shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                {t("Thank you for trusting us with this. A moderator will read your story before anyone else sees it. You can follow its progress, or take it down, in the list below.")}
              </p>
            </div>
          )}

          <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-notice-bg text-notice-text text-sm">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {t("Please leave out names, places, phone numbers and anything that could identify you or anyone else, including the person who hurt you. Moderators will not publish stories that include them.")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low">
              <div>
                <p className="text-xs text-on-surface-variant">{t("Your name on this story")}</p>
                <p className="text-lg font-semibold text-primary">{pseudonym}</p>
              </div>
              <button type="button" onClick={newPseudonym} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors">
                <RefreshCw size={16} />
                {t("New name")}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="topic" className="text-sm font-semibold text-on-surface">{t("What is your story mostly about?")}</label>
              <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass}>
                {STORY_TOPICS.map((tp) => (
                  <option key={tp.key} value={tp.key}>{t(tp.label)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-semibold text-on-surface">{t("Title")}</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder={t("A few words")} className={inputClass} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="body" className="text-sm font-semibold text-on-surface">{t("Your story")}</label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={4000}
                rows={10}
                className="w-full rounded-xl border border-border-soft bg-card px-4 py-3 text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
              <span className="text-xs text-on-surface-variant self-end">{body.length} / 4000</span>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-5 h-5 accent-[#4A3B52]" />
              <span className="text-sm text-on-surface leading-relaxed">
                {t("I understand a moderator will read my story first, that anyone who uses this site can read it once published, and that I can take it down at any time from this device.")}
              </span>
            </label>

            {error && <p className="text-sm text-error font-semibold">{error}</p>}

            <button type="submit" disabled={saving || !agree || !user} className="h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50">
              {saving ? t("Sending...") : t("Send my story for review")}
            </button>
          </form>

          {mine.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold text-primary">{t("Your stories")}</h2>
              <p className="text-xs text-on-surface-variant">
                {t("These are tied to this device. If you clear your browser data, you will no longer see them here.")}
              </p>
              <ul className="flex flex-col gap-3">
                {mine.map((s) => {
                  const st = STATUS_LABEL[s.status] || STATUS_LABEL.rejected;
                  return (
                    <li key={s.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-primary">{s.title}</p>
                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + st.style}>{t(st.text)}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{t(TOPIC_LABEL[s.topic] || "Story")}</p>
                      {s.status === "rejected" && (
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {t("A moderator could not publish this, often because it included details that could identify someone. You are welcome to write it again without them.")}
                        </p>
                      )}
                      <button onClick={() => withdraw(s)} className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80 transition-opacity">
                        <Trash2 size={16} />
                        {t("Take down")}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
