"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { STORY_TOPICS, TOPIC_LABEL } from "@/lib/community";
import { PenLine, TriangleAlert, Flag, ChevronDown, ChevronUp } from "lucide-react";

type Story = {
  id: string;
  title: string;
  body: string;
  topic: string;
  pseudonym: string;
  authorUid: string;
  createdAt?: { seconds: number };
};

export default function StoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const [stories, setStories] = useState<Story[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [reported, setReported] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading || !user) return;
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, "stories"), where("status", "==", "published"), limit(100)));
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Story, "id">) }));
        list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setStories(list);
      } catch (err) {
        console.error("Failed to load stories:", err);
        setError("Could not load stories right now. Please try again.");
      }
      setFetching(false);
    }
    load();
  }, [authLoading, user]);

  const visible = useMemo(
    () => (topic === "all" ? stories : stories.filter((s) => s.topic === topic)),
    [stories, topic]
  );

  async function report(s: Story) {
    if (!user) return;
    if (!window.confirm(t("Report this story to the moderators?"))) return;
    try {
      await addDoc(collection(db, "reports"), {
        kind: "story",
        targetId: s.id,
        preview: s.title.slice(0, 200),
        authorUid: s.authorUid,
        reporterUid: user.uid,
        createdAt: serverTimestamp(),
      });
      setReported((prev) => ({ ...prev, [s.id]: true }));
    } catch (err) {
      console.error("Failed to report:", err);
      setError("Could not send your report. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader active="/community" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[900px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Link href="/community" className="text-sm font-semibold text-primary hover:underline">{t("Back to the community")}</Link>
              <h1 className="text-3xl font-semibold text-primary mt-1">{t("Stories")}</h1>
              <p className="text-on-surface-variant mt-1">{t("In their own words, shared under made-up names.")}</p>
            </div>
            <Link href="/community/stories/share" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors shadow-sm">
              <PenLine size={18} />
              {t("Share your story")}
            </Link>
          </div>

          <div className="rounded-xl bg-notice-bg text-notice-text p-4 flex items-start gap-3">
            <TriangleAlert size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              {t("These stories describe violence and may be upsetting. Take breaks whenever you need to. If you need to talk to someone now, call 116.")}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[{ key: "all", label: "All stories" }, ...STORY_TOPICS].map((tp) => (
              <button
                key={tp.key}
                onClick={() => setTopic(tp.key)}
                className={
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all " +
                  (topic === tp.key ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface")
                }
              >
                {t(tp.label)}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-error font-semibold">{t(error)}</p>}
          {fetching && <p className="text-on-surface-variant">{t("Loading...")}</p>}
          {!fetching && !error && visible.length === 0 && (
            <p className="text-center text-on-surface-variant py-10">{t("No stories here yet. You could be the first to share one.")}</p>
          )}

          <div className="flex flex-col gap-5">
            {visible.map((s) => {
              const isOpen = open === s.id;
              const long = s.body.length > 260;
              const text = isOpen || !long ? s.body : s.body.slice(0, 260).trimEnd() + "...";
              return (
                <article key={s.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-surface-container text-sm text-on-surface-variant font-semibold">
                      {t(TOPIC_LABEL[s.topic] || "Story")}
                    </span>
                    {s.createdAt && (
                      <span className="text-xs text-on-surface-variant">
                        {new Date(s.createdAt.seconds * 1000).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB")}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-primary">{s.title}</h2>
                  <p className="text-sm text-on-surface-variant">{t("Shared by {name}", { name: s.pseudonym })}</p>
                  <p className="text-on-surface leading-relaxed whitespace-pre-line">{text}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {long ? (
                      <button onClick={() => setOpen(isOpen ? null : s.id)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isOpen ? t("Show less") : t("Read the full story")}
                      </button>
                    ) : (
                      <span />
                    )}
                    <button onClick={() => report(s)} disabled={!!reported[s.id]} className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary disabled:opacity-60">
                      <Flag size={14} />
                      {reported[s.id] ? t("Reported, thank you") : t("Report")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
