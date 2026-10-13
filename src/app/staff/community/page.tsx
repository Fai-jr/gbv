"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { ROOMS, TOPIC_LABEL } from "@/lib/community";
import { Check, X, Trash2, VolumeX, Volume2, Eye, ShieldAlert } from "lucide-react";

type Ts = { seconds: number };
type PendingStory = { id: string; title: string; body: string; topic: string; pseudonym: string; createdAt?: Ts };
type Report = { id: string; kind: "story" | "message"; targetId: string; roomId?: string; preview?: string; authorUid?: string; createdAt?: Ts };
type Muted = { id: string; mutedAt?: Ts };
type Msg = { id: string; text: string; pseudonym: string; authorUid: string; createdAt?: Ts | null };

type Tab = "stories" | "rooms" | "reports" | "muted";

function when(ts?: Ts | null) {
  return ts ? new Date(ts.seconds * 1000).toLocaleString() : "just now";
}

export default function CommunityModerationPage() {
  const { user, profile, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("stories");
  const [stories, setStories] = useState<PendingStory[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [muted, setMuted] = useState<Muted[]>([]);
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [liveRoom, setLiveRoom] = useState<string | null>(null);
  const [live, setLive] = useState<Msg[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isStaff = !!profile && ["ngo_staff", "shelter_staff", "admin"].includes(profile.role);

  async function loadAll() {
    try {
      const [st, rp, mu] = await Promise.all([
        getDocs(query(collection(db, "stories"), where("status", "==", "pending"), limit(50))),
        getDocs(query(collection(db, "reports"), limit(100))),
        getDocs(collection(db, "muted")),
      ]);
      const sl = st.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PendingStory, "id">) }));
      sl.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      setStories(sl);
      const rl = rp.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Report, "id">) }));
      rl.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setReports(rl);
      setMuted(mu.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Muted, "id">) })));
    } catch (err) {
      console.error("Moderation load failed:", err);
      setError("Could not load everything. Please refresh.");
    }
  }

  useEffect(() => {
    if (loading || !isStaff) return;
    loadAll();
    return onSnapshot(collection(db, "roomSettings"), (snap) => {
      const map: Record<string, boolean> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data().open === true));
      setSettings(map);
    });
  }, [loading, isStaff]);

  useEffect(() => {
    if (!liveRoom || !isStaff) return;
    setLive([]);
    return onSnapshot(
      query(collection(db, "rooms", liveRoom, "messages"), orderBy("createdAt", "desc"), limit(100)),
      (snap) => setLive(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Msg, "id">) })).reverse()),
      (err) => console.error("Live view error:", err)
    );
  }, [liveRoom, isStaff]);

  async function run(action: () => Promise<void>, done?: string) {
    setError("");
    setMessage("");
    try {
      await action();
      if (done) setMessage(done);
    } catch (err) {
      console.error("Moderation action failed:", err);
      setError("That did not work. Please try again.");
    }
  }

  const setRoomOpen = (roomId: string, open: boolean) =>
    run(async () => {
      await setDoc(doc(db, "roomSettings", roomId), { open, updatedAt: serverTimestamp(), updatedBy: user!.uid });
    });

  const review = (s: PendingStory, status: "published" | "rejected") =>
    run(async () => {
      await updateDoc(doc(db, "stories", s.id), { status, reviewedAt: serverTimestamp(), reviewedBy: user!.uid });
      setStories((prev) => prev.filter((x) => x.id !== s.id));
    }, status === "published" ? "Story published." : "Story not published.");

  const mute = (uid: string) =>
    run(async () => {
      await setDoc(doc(db, "muted", uid), { mutedAt: serverTimestamp(), mutedBy: user!.uid });
      setMuted((prev) => (prev.some((m) => m.id === uid) ? prev : [...prev, { id: uid, mutedAt: { seconds: Math.floor(Date.now() / 1000) } }]));
    }, "Muted. They can no longer post messages or stories.");

  const unmute = (uid: string) =>
    run(async () => {
      await deleteDoc(doc(db, "muted", uid));
      setMuted((prev) => prev.filter((m) => m.id !== uid));
    }, "Unmuted.");

  const deleteMessage = (roomId: string, id: string) =>
    run(async () => {
      await deleteDoc(doc(db, "rooms", roomId, "messages", id));
    });

  const handleReport = (r: Report, action: "dismiss" | "remove" | "remove-mute") =>
    run(async () => {
      if (action !== "dismiss") {
        if (r.kind === "story") await deleteDoc(doc(db, "stories", r.targetId));
        else if (r.roomId) await deleteDoc(doc(db, "rooms", r.roomId, "messages", r.targetId));
      }
      if (action === "remove-mute" && r.authorUid) {
        await setDoc(doc(db, "muted", r.authorUid), { mutedAt: serverTimestamp(), mutedBy: user!.uid });
      }
      await deleteDoc(doc(db, "reports", r.id));
      await loadAll();
    }, "Done.");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "stories", label: "Stories to review", count: stories.length },
    { key: "rooms", label: "Live rooms" },
    { key: "reports", label: "Reports", count: reports.length },
    { key: "muted", label: "Muted", count: muted.length },
  ];

  return (
    <StaffShell title="Community moderation" subtitle="Keep the community safe: review stories, watch rooms and act on reports.">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-notice-bg text-notice-text max-w-3xl">
        <ShieldAlert size={20} className="shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          Before publishing a story, check it for names, places, phone numbers or anything that could identify
          someone, including the person who caused harm. Open a live room only while you are watching it.
        </p>
      </div>

      {error && <p className="text-sm text-error font-semibold">{error}</p>}
      {message && <p className="text-sm text-available-text font-semibold">{message}</p>}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all " +
              (tab === t.key ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface")
            }
          >
            {t.label}
            {t.count !== undefined ? " (" + t.count + ")" : ""}
          </button>
        ))}
      </div>

      {tab === "stories" && (
        <section className="flex flex-col gap-4">
          {stories.length === 0 && <p className="text-on-surface-variant">No stories are waiting for review.</p>}
          {stories.map((s) => (
            <article key={s.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-surface-container text-sm text-on-surface-variant font-semibold">{TOPIC_LABEL[s.topic] || "Story"}</span>
                <span className="text-xs text-on-surface-variant">{when(s.createdAt)}</span>
              </div>
              <h2 className="text-xl font-semibold text-primary">{s.title}</h2>
              <p className="text-sm text-on-surface-variant">By {s.pseudonym}</p>
              <p className="text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low rounded-xl p-4">{s.body}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => review(s, "published")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
                  <Check size={18} />
                  Publish
                </button>
                <button onClick={() => review(s, "rejected")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                  <X size={18} />
                  Do not publish
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === "rooms" && (
        <section className="flex flex-col gap-4">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROOMS.map((r) => {
              const open = settings[r.id] === true;
              return (
                <li key={r.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-primary">{r.name}</span>
                    <span className={"px-2.5 py-0.5 rounded-full text-xs font-semibold " + (open ? "bg-available-bg text-available-text" : "bg-surface-container-high text-on-surface-variant")}>
                      {open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setRoomOpen(r.id, !open)} className={"px-4 py-2.5 rounded-xl font-semibold transition-colors " + (open ? "bg-full-bg text-full-text hover:opacity-80" : "bg-primary-container text-on-primary hover:bg-primary")}>
                      {open ? "Close room" : "Open room"}
                    </button>
                    <button onClick={() => setLiveRoom(r.id)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                      <Eye size={18} />
                      Watch live
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {liveRoom && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-primary">Live: {ROOMS.find((r) => r.id === liveRoom)?.name}</h2>
                <button onClick={() => setLiveRoom(null)} className="text-sm font-semibold text-primary hover:underline">Stop watching</button>
              </div>
              {live.length === 0 && <p className="text-sm text-on-surface-variant">No messages yet.</p>}
              <ul className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
                {live.map((m) => (
                  <li key={m.id} className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-on-surface-variant">
                      <span className="font-semibold">{m.pseudonym}</span>
                      <span>{when(m.createdAt)}</span>
                    </div>
                    <p className="text-on-surface">{m.text}</p>
                    <div className="flex gap-2">
                      <button onClick={() => deleteMessage(liveRoom, m.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-full-bg text-full-text text-xs font-semibold hover:opacity-80">
                        <Trash2 size={14} />
                        Delete
                      </button>
                      <button onClick={() => mute(m.authorUid)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high">
                        <VolumeX size={14} />
                        Mute author
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {tab === "reports" && (
        <section className="flex flex-col gap-4">
          {reports.length === 0 && <p className="text-on-surface-variant">No reports.</p>}
          {reports.map((r) => (
            <article key={r.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-notice-bg text-notice-text text-xs font-semibold capitalize">{r.kind} reported</span>
                <span className="text-xs text-on-surface-variant">{when(r.createdAt)}</span>
              </div>
              <p className="text-on-surface bg-surface-container-low rounded-xl p-3">{r.preview || "(no preview)"}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleReport(r, "dismiss")} className="px-4 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high">
                  Dismiss report
                </button>
                <button onClick={() => handleReport(r, "remove")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80">
                  <Trash2 size={16} />
                  Remove {r.kind}
                </button>
                {r.authorUid && (
                  <button onClick={() => handleReport(r, "remove-mute")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80">
                    <VolumeX size={16} />
                    Remove and mute author
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === "muted" && (
        <section className="flex flex-col gap-3">
          {muted.length === 0 && <p className="text-on-surface-variant">Nobody is muted.</p>}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {muted.map((m) => (
              <li key={m.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">Device {m.id.slice(0, 6)}</p>
                  <p className="text-xs text-on-surface-variant">{when(m.mutedAt)}</p>
                </div>
                <button onClick={() => unmute(m.id)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high">
                  <Volume2 size={16} />
                  Unmute
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </StaffShell>
  );
}
