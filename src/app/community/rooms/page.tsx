"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { HOUSE_RULES, ROOMS, checkContent, getPseudonym, looksUrgent } from "@/lib/community";
import { Send, Flag, Lock, ShieldAlert, Users } from "lucide-react";

type Msg = { id: string; text: string; pseudonym: string; authorUid: string; createdAt?: { seconds: number } | null };

export default function RoomsPage() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [error, setError] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const lastSent = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPseudonym(getPseudonym());
  }, []);

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
    if (!roomId || !user) return;
    setMessages([]);
    setError("");
    return onSnapshot(
      query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "desc"), limit(60)),
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Msg, "id">) })).reverse());
      },
      (err) => {
        console.error("Messages error:", err);
        setError("Could not load this room right now.");
      }
    );
  }, [roomId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const room = ROOMS.find((r) => r.id === roomId) || null;
  const isOpen = roomId ? settings[roomId] === true : false;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !roomId) return;
    setError("");
    const problem = checkContent(text, 500);
    if (problem) {
      setError(problem);
      return;
    }
    if (Date.now() - lastSent.current < 4000) {
      setError("Please wait a few seconds between messages.");
      return;
    }
    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
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
      setError("Your message could not be sent. The room may have just closed.");
    }
  }

  async function report(m: Msg) {
    if (!user || !roomId) return;
    if (!window.confirm("Report this message to the moderators?")) return;
    try {
      await addDoc(collection(db, "reports"), {
        kind: "message",
        targetId: m.id,
        roomId,
        preview: m.text.slice(0, 200),
        authorUid: m.authorUid,
        reporterUid: user.uid,
        createdAt: serverTimestamp(),
      });
      setReported((prev) => ({ ...prev, [m.id]: true }));
    } catch (err) {
      console.error("Report failed:", err);
      setError("Could not send your report. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader active="/community" />
      <main className="w-full pt-32 pb-24 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-6">
          <div>
            <Link href="/community" className="text-sm font-semibold text-primary hover:underline">Back to the community</Link>
            <h1 className="text-3xl font-semibold text-primary mt-1">Live rooms</h1>
            <p className="text-on-surface-variant mt-1">
              Rooms are open only while a moderator is present. You appear as <strong>{pseudonym}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <aside className="lg:col-span-4 flex flex-col gap-3">
              {ROOMS.map((r) => {
                const open = settings[r.id] === true;
                const active = roomId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRoomId(r.id)}
                    className={
                      "text-left rounded-xl p-5 shadow-sm transition-all flex flex-col gap-2 " +
                      (active ? "bg-primary-container text-on-primary" : "bg-surface-container-lowest hover:shadow-md")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{r.name}</span>
                      <span
                        className={
                          "px-2.5 py-0.5 rounded-full text-xs font-semibold " +
                          (open ? "bg-available-bg text-available-text" : "bg-surface-container-high text-on-surface-variant")
                        }
                      >
                        {open ? "Open now" : "Closed"}
                      </span>
                    </div>
                    <span className={"text-sm " + (active ? "text-on-primary-container" : "text-on-surface-variant")}>{r.description}</span>
                  </button>
                );
              })}
              <div className="rounded-xl bg-surface-container p-4 text-sm text-on-surface-variant flex items-start gap-3">
                <ShieldAlert size={18} className="text-tertiary shrink-0 mt-0.5" />
                <span className="leading-relaxed">If you are in danger right now, call <strong>116</strong>. Do not wait for a reply here.</span>
              </div>
            </aside>

            <section className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[560px]">
              {!room ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center">
                  <Users size={36} className="text-primary/30" />
                  <p className="text-on-surface-variant">Choose a room on the left to see the conversation.</p>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary">{room.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {isOpen ? "A moderator is present" : "Closed. It opens when a moderator is present."}
                      </p>
                    </div>
                    <Lock size={18} className="text-on-surface-variant" />
                  </div>

                  <div className="px-6 py-3 bg-surface-container text-xs text-on-surface-variant leading-relaxed">
                    <strong>Remember:</strong> {HOUSE_RULES[1]}
                  </div>

                  <div className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto max-h-[460px]">
                    {messages.length === 0 && (
                      <p className="text-center text-on-surface-variant text-sm py-8">
                        {isOpen ? "No messages yet. You could say hello." : "Nothing here right now."}
                      </p>
                    )}
                    {messages.map((m) => {
                      const mine = m.authorUid === user?.uid;
                      return (
                        <div key={m.id} className={"flex flex-col gap-1 max-w-[85%] " + (mine ? "self-end items-end" : "self-start items-start")}>
                          <span className="text-xs text-on-surface-variant">
                            {mine ? "You" : m.pseudonym}
                            {" \u2022 "}
                            {m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now"}
                          </span>
                          <div className={"px-4 py-3 rounded-2xl leading-relaxed " + (mine ? "bg-primary-container text-on-primary rounded-tr-sm" : "bg-surface-container-low text-on-surface rounded-tl-sm")}>
                            {m.text}
                          </div>
                          {!mine && (
                            <button
                              onClick={() => report(m)}
                              disabled={!!reported[m.id]}
                              className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary disabled:opacity-60"
                            >
                              <Flag size={12} />
                              {reported[m.id] ? "Reported" : "Report"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {urgent && (
                    <div className="mx-6 mb-3 rounded-xl bg-notice-bg text-notice-text p-4 text-sm leading-relaxed">
                      <strong>We are glad you said something.</strong> If you are in danger, or thinking of
                      ending your life, please tell someone near you or call <strong>116</strong> now. People
                      in this room are not trained to help in an emergency.
                    </div>
                  )}

                  <form onSubmit={send} className="p-4 border-t border-border-soft flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-1.5">
                      <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={500}
                        disabled={!isOpen}
                        placeholder={isOpen ? "Write a message..." : "This room is closed right now"}
                        className="flex-1 bg-transparent py-2.5 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={!isOpen || !text.trim()}
                        className="h-11 px-5 rounded-xl bg-primary-container text-on-primary font-semibold flex items-center gap-2 hover:bg-primary transition-colors disabled:opacity-50"
                      >
                        <span>Send</span>
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
