"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { STORY_TOPICS, checkContent } from "@/lib/community";
import { usePseudonym } from "@/lib/usePseudonym";
import { ShieldAlert, RefreshCw, Trash2, CheckCircle2, Info } from "lucide-react";

type Mine = { id: string; name: string; topic: string; status: string; createdAt?: { seconds: number } };

const STATUS: Record<string, { text: string; style: string }> = {
  pending: { text: "Waiting for a moderator", style: "bg-notice-bg text-notice-text" },
  approved: { text: "Approved", style: "bg-available-bg text-available-text" },
  rejected: { text: "Not approved", style: "bg-surface-container-high text-on-surface-variant" },
};

const HOW = [
  "A moderator reads your request before anyone else sees it.",
  "Once approved, your group appears on the Live rooms page for everyone.",
  "The group chat opens only when a moderator is present to watch it. You cannot open it yourself.",
  "Moderators can close or remove any group at any time.",
  "You are not in charge of other members. If someone is unkind, use the Report button.",
];

const inputClass =
  "w-full h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

export default function NewGroupPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const [pseudonym, newPseudonym] = usePseudonym();
  const [topic, setTopic] = useState(STORY_TOPICS[0].key);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [mine, setMine] = useState<Mine[]>([]);

  async function loadMine() {
    if (!user) return;
    try {
      const snap = await getDocs(query(collection(db, "groups"), where("creatorUid", "==", user.uid)));
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Mine, "id">) }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setMine(list);
    } catch (err) {
      console.error("Failed to load your groups:", err);
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
    const problem = checkContent(name, 60, 3, t) || checkContent(description, 300, 10, t);
    if (problem) {
      setError(problem);
      return;
    }
    if (mine.filter((g) => g.status !== "rejected").length >= 3) {
      setError(t("You can have up to 3 groups at a time. Take one down before starting another."));
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "groups"), {
        name: name.trim(),
        description: description.trim(),
        topic,
        creatorUid: user.uid,
        creatorPseudonym: pseudonym,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setName("");
      setDescription("");
      setSent(true);
      await loadMine();
    } catch (err) {
      console.error("Failed to submit group:", err);
      setError(t("Your group could not be sent. Please try again in a moment."));
    }
    setSaving(false);
  }

  async function withdraw(g: Mine) {
    if (!window.confirm(t("Take down \"{name}\"? This cannot be undone.", { name: g.name }))) return;
    try {
      await deleteDoc(doc(db, "groups", g.id));
      setMine((prev) => prev.filter((x) => x.id !== g.id));
    } catch (err) {
      console.error("Failed to withdraw group:", err);
      setError(t("Could not take that down. Please try again."));
    }
  }

  return (
    <>
      <SiteHeader active="/community" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[760px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div>
            <Link href="/community" className="text-sm font-semibold text-primary hover:underline">
              {t("Back to the community")}
            </Link>
            <h1 className="text-3xl font-semibold text-primary mt-1">{t("Start a support group")}</h1>
            <p className="text-on-surface-variant mt-1">
              {t("Bring together people who share something, so no one has to carry it alone.")}
            </p>
          </div>

          <div className="bg-surface-container rounded-xl p-5 flex flex-col gap-3">
            <p className="font-semibold text-primary flex items-center gap-2">
              <Info size={18} className="text-tertiary" />
              {t("How groups work")}
            </p>
            <ol className="flex flex-col gap-2 text-sm text-on-surface-variant">
              {HOW.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                  <span className="leading-relaxed">{t(h)}</span>
                </li>
              ))}
            </ol>
          </div>

          {sent && (
            <div className="rounded-xl bg-available-bg text-available-text p-4 flex items-start gap-3">
              <CheckCircle2 size={22} className="shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                {t("Thank you. A moderator will read your request first. You can follow its progress below.")}
              </p>
            </div>
          )}

          <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-notice-bg text-notice-text text-sm">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {t("Please do not include names, places, phone numbers or links. Moderators will not approve groups that include them.")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low">
              <div>
                <p className="text-xs text-on-surface-variant">{t("Your name for this group")}</p>
                <p className="text-lg font-semibold text-primary">{pseudonym}</p>
              </div>
              <button
                type="button"
                onClick={newPseudonym}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
              >
                <RefreshCw size={16} />
                {t("New name")}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="g-topic" className="text-sm font-semibold text-on-surface">{t("What is this group about?")}</label>
              <select id="g-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass}>
                {STORY_TOPICS.map((tp) => (
                  <option key={tp.key} value={tp.key}>{t(tp.label)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="g-name" className="text-sm font-semibold text-on-surface">{t("Group name")}</label>
              <input
                id="g-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder={t("For example: Starting again after leaving")}
                className={inputClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="g-desc" className="text-sm font-semibold text-on-surface">{t("Description")}</label>
              <textarea
                id="g-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={4}
                placeholder={t("Say who the group is for and what you hope to talk about.")}
                className="w-full rounded-xl border border-border-soft bg-card px-4 py-3 text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
              <span className="text-xs text-on-surface-variant self-end">{description.length} / 300</span>
            </div>

            {error && <p className="text-sm text-error font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={saving || !user}
              className="h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
            >
              {saving ? t("Sending...") : t("Send my group for review")}
            </button>
          </form>

          {mine.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold text-primary">{t("Your groups")}</h2>
              <p className="text-xs text-on-surface-variant">
                {t("These are tied to this device. If you clear your browser data, you will no longer see them here.")}
              </p>
              <ul className="flex flex-col gap-3">
                {mine.map((g) => {
                  const st = STATUS[g.status] || STATUS.rejected;
                  return (
                    <li key={g.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-primary">{g.name}</p>
                        <span className={"px-3 py-1 rounded-full text-xs font-semibold " + st.style}>{t(st.text)}</span>
                      </div>
                      {g.status === "rejected" && (
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {t("A moderator could not approve this group. You are welcome to try again with a different name or description.")}
                        </p>
                      )}
                      {g.status === "pending" && (
                        <button
                          onClick={() => withdraw(g)}
                          className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80 transition-opacity"
                        >
                          <Trash2 size={16} />
                          {t("Take down")}
                        </button>
                      )}
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
