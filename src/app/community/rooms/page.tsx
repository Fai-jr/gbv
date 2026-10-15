"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import { usePseudonym } from "@/lib/usePseudonym";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RoomButton from "@/components/RoomButton";
import type { RoomItem } from "@/components/RoomButton";
import { HOUSE_RULES, ROOMS, checkContent, looksUrgent } from "@/lib/community";
import { Send, Flag, Lock, ShieldAlert, Users, Plus } from "lucide-react";

type Msg = { id: string; text: string; pseudonym: string; authorUid: string; createdAt?: { seconds: number } | null };
type Group = { id: string; name: string; description: string; creatorPseudonym: string; creatorUid: string };

export default function RoomsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const [pseudonym] = usePseudonym();
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [box, setBox] = useState<{ id: string | null; list: Msg[] }>({ id: null, list: [] });
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [groupReported, setGroupReported] = useState<Record<string, boolean>>({});
  const lastSent = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const rooms: RoomItem[] = ROOMS.map((r) => ({ id: r.id, name: r.name, description: r.description, official: true }));
  const groupItems: RoomItem[] = groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    official: false,
    by: g.creatorPseudonym,
    creatorUid: g.creatorUid,
  }));
  const current = [...rooms, ...groupItems].find((i) => i.id === roomId) || null;
  const activeId = current ? current.id : null;
  const messages = box.id === activeId ? box.list : [];
  const isOpen = activeId ? settings[activeId] === true : false;

  useEffect(() => {
    if (authLoading || !user) return;
    return onSnapshot(
      collection(db, "roomSettings"),
      (snap) => {
        const map: Record<string, boolean> = {};
        snap.docs.forEach((d) => (map[d.id] = d.data().open === true));
        setSettings(map);
      },
      (err) => console.error("Room settings error:", err)
    );
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;
    return onSnapshot(
      query(collection(db, "groups"), where("status", "==", "approved")),
      (snap) => setGroups(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Group, "id">) }))),
      (err) => console.error("Groups error:", err)
    );
  }, [authLoading, user]);

  useEffect(() => {
    if (!activeId || !user) return;
    return onSnapshot(
      query(collection(db, "rooms", activeId, "messages"), orderBy("createdAt", "desc"), limit(60)),
      (snap) =>
        setBox({
          id: activeId,
          list: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Msg, "id">) })).reverse(),
        }),
      (err) => {
        console.error("Messages error:", err);
        setError(t("Could not load this room right now."));
      }
    );
  }, [activeId, user, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function selectRoom(id: string) {
    setRoomId(id);
    setError("");
    setUrgent(false);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !activeId) return;
    setError("");
    const problem = checkContent(text, 500, 1, t);
    if (problem) {
      setError(problem);
      return;
    }
    if (Date.now() - lastSent.current < 4000) {
      setError(t("Please wait a few seconds between messages."));
      return;
    }
    try {
      await addDoc(collection(db, "rooms", activeId, "messages"), {
        text: text.trim(),
        pseudonym,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });
      lastSent.current = Date.now();
      setUrgent(looksUrgent(text));
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
      setError(t("Your message could not be sent. The room may have just closed."));
    }
  }

  async function reportMessage(m: Msg) {
    if (!user || !activeId) return;
    if (!window.confirm(t("Report this message to the moderators?"))) return;
    try {
      await addDoc(collection(db, "reports"), {
        kind: "message",
        targetId: m.id,
        roomId: activeId,
        preview: m.text.slice(0, 200),
        authorUid: m.authorUid,
        reporterUid: user.uid,
        createdAt: serverTimestamp(),
      });
      setReported((prev) => ({ ...prev, [m.id]: true }));
    } catch (err) {
      console.error("Report failed:", err);
      setError(t("Could not send your report. Please try again."));
    }
  }

  async function reportGroup(i: RoomItem) {
    if (!user) return;
    if (!window.confirm(t("Report this group to the moderators?"))) return;
    try {
      await addDoc(collection(db, "reports"), {
        kind: "group",
        targetId: i.id,
        preview: i.name.slice(0, 200),
        authorUid: i.creatorUid,
        reporterUid: user.uid,
        createdAt: serverTimestamp(),
      });
      setGroupReported((prev) => ({ ...prev, [i.id]: true }));
    } catch (err) {
      console.error("Group report failed:", err);
      setError(t("Could not send your report. Please try again."));
    }
  }

  return (
    <>
      <SiteHeader active="/community" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div>
            <Link href="/community" className="text-sm font-semibold text-primary hover:underline">
              {t("Back to the community")}
            </Link>
            <h1 className="text-3xl font-semibold text-primary mt-1">{t("Live rooms")}</h1>
            <p className="text-on-surface-variant mt-1">
              {t("Rooms are open only while a moderator is present. You appear as {name}.", { name: pseudonym })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <aside className="lg:col-span-4 flex flex-col gap-3">
              <h2 className="text-sm uppercase tracking-wider font-bold text-tertiary">{t("Official rooms")}</h2>
              {rooms.map((r) => (
                <RoomButton key={r.id} item={r} open={settings[r.id] === true} active={activeId === r.id} onSelect={selectRoom} />
              ))}

              <h2 className="text-sm uppercase tracking-wider font-bold text-tertiary pt-3">
                {t("Support groups started by members")}
              </h2>
              {groupItems.length === 0 && (
                <p className="text-sm text-on-surface-variant">{t("No groups yet. You could start the first one.")}</p>
              )}
              {groupItems.map((g) => (
                <RoomButton key={g.id} item={g} open={settings[g.id] === true} active={activeId === g.id} onSelect={selectRoom} />
              ))}
              <Link
                href="/community/groups/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold shadow-sm hover:bg-surface-container transition-colors"
              >
                <Plus size={18} />
                {t("Start a group")}
              </Link>

              <div className="rounded-xl bg-surface-container p-4 text-sm text-on-surface-variant flex items-start gap-3">
                <ShieldAlert size={18} className="text-tertiary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{t("If you are in danger right now, call 116. Do not wait for a reply here.")}</span>
              </div>
            </aside>

            <section className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[560px]">
              {!current ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center">
                  <Users size={36} className="text-primary/30" />
                  <p className="text-on-surface-variant">{t("Choose a room to see the conversation.")}</p>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-primary truncate">{current.official ? t(current.name) : current.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {isOpen ? t("A moderator is present") : t("Closed. It opens when a moderator is present.")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!current.official && (
                        <button
                          onClick={() => reportGroup(current)}
                          disabled={!!groupReported[current.id]}
                          className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary disabled:opacity-60"
                        >
                          <Flag size={12} />
                          {groupReported[current.id] ? t("Group reported, thank you") : t("Report group")}
                        </button>
                      )}
                      <Lock size={18} className="text-on-surface-variant" />
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-surface-container text-xs text-on-surface-variant leading-relaxed">
                    <strong>{t("Remember:")}</strong> {t(HOUSE_RULES[1])}
                  </div>

                  <div className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto max-h-[460px]">
                    {messages.length === 0 && (
                      <p className="text-center text-on-surface-variant text-sm py-8">
                        {isOpen ? t("No messages yet. You could say hello.") : t("Nothing here right now.")}
                      </p>
                    )}
                    {messages.map((m) => {
                      const mine = m.authorUid === user?.uid;
                      return (
                        <div key={m.id} className={"flex flex-col gap-1 max-w-[85%] " + (mine ? "self-end items-end" : "self-start items-start")}>
                          <span className="text-xs text-on-surface-variant">
                            {mine ? t("You") : m.pseudonym}
                            {" \u2022 "}
                            {m.createdAt
                              ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : t("now")}
                          </span>
                          <div className={"px-4 py-3 rounded-2xl leading-relaxed " + (mine ? "bg-primary-container text-on-primary rounded-tr-sm" : "bg-surface-container-low text-on-surface rounded-tl-sm")}>
                            {m.text}
                          </div>
                          {!mine && (
                            <button
                              onClick={() => reportMessage(m)}
                              disabled={!!reported[m.id]}
                              className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary disabled:opacity-60"
                            >
                              <Flag size={12} />
                              {reported[m.id] ? t("Reported") : t("Report")}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {urgent && (
                    <div className="mx-6 mb-3 rounded-xl bg-notice-bg text-notice-text p-4 text-sm leading-relaxed">
                      {t("We are glad you said something. If you are in danger, or thinking of ending your life, please tell someone near you or call 116 now. People in this room are not trained to help in an emergency.")}
                    </div>
                  )}

                  <form onSubmit={send} className="p-4 border-t border-border-soft flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-1.5">
                      <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={500}
                        disabled={!isOpen}
                        placeholder={isOpen ? t("Write a message...") : t("This room is closed right now")}
                        className="flex-1 bg-transparent py-2.5 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={!isOpen || !text.trim()}
                        className="h-11 px-5 rounded-xl bg-primary-container text-on-primary font-semibold flex items-center gap-2 hover:bg-primary transition-colors disabled:opacity-50"
                      >
                        <span>{t("Send")}</span>
                        <Send size={18} />
                      </button>
                    </div>
                    {error && <p className="text-sm text-error font-semibold px-1">{error}</p>}
                  </form>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
