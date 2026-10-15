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
import StoriesPanel from "@/components/moderation/StoriesPanel";
import GroupsPanel from "@/components/moderation/GroupsPanel";
import RoomsPanel from "@/components/moderation/RoomsPanel";
import ReportsPanel from "@/components/moderation/ReportsPanel";
import type { ReportAction } from "@/components/moderation/ReportsPanel";
import MutedPanel from "@/components/moderation/MutedPanel";
import type { Group, Msg, Muted, PendingStory, Report } from "@/components/moderation/types";
import { ShieldAlert } from "lucide-react";

type Tab = "stories" | "groups" | "rooms" | "reports" | "muted";

export default function CommunityModerationPage() {
  const { user, profile, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("stories");
  const [stories, setStories] = useState<PendingStory[]>([]);
  const [pendingGroups, setPendingGroups] = useState<Group[]>([]);
  const [approvedGroups, setApprovedGroups] = useState<Group[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [muted, setMuted] = useState<Muted[]>([]);
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [liveRoom, setLiveRoom] = useState<string | null>(null);
  const [liveBox, setLiveBox] = useState<{ id: string | null; list: Msg[] }>({ id: null, list: [] });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isStaff = !!profile && ["ngo_staff", "shelter_staff", "admin"].includes(profile.role);
  const live = liveBox.id === liveRoom ? liveBox.list : [];

  async function loadAll() {
    try {
      const [st, rp, mu, gp, ga] = await Promise.all([
        getDocs(query(collection(db, "stories"), where("status", "==", "pending"), limit(50))),
        getDocs(query(collection(db, "reports"), limit(100))),
        getDocs(collection(db, "muted")),
        getDocs(query(collection(db, "groups"), where("status", "==", "pending"), limit(50))),
        getDocs(query(collection(db, "groups"), where("status", "==", "approved"), limit(100))),
      ]);
      const sl = st.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PendingStory, "id">) }));
      sl.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      setStories(sl);
      const rl = rp.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Report, "id">) }));
      rl.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setReports(rl);
      setMuted(mu.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Muted, "id">) })));
      const gl = gp.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Group, "id">) }));
      gl.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      setPendingGroups(gl);
      setApprovedGroups(ga.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Group, "id">) })));
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
    return onSnapshot(
      query(collection(db, "rooms", liveRoom, "messages"), orderBy("createdAt", "desc"), limit(100)),
      (snap) =>
        setLiveBox({
          id: liveRoom,
          list: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Msg, "id">) })).reverse(),
        }),
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

  async function purgeGroup(id: string) {
    for (let i = 0; i < 10; i++) {
      const snap = await getDocs(query(collection(db, "rooms", id, "messages"), limit(50)));
      if (snap.empty) break;
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }
    await deleteDoc(doc(db, "roomSettings", id));
    await deleteDoc(doc(db, "groups", id));
  }

  const setRoomOpen = (roomId: string, open: boolean) =>
    run(async () => {
      await setDoc(doc(db, "roomSettings", roomId), { open, updatedAt: serverTimestamp(), updatedBy: user!.uid });
    });

  const reviewStory = (s: PendingStory, status: "published" | "rejected") =>
    run(async () => {
      await updateDoc(doc(db, "stories", s.id), { status, reviewedAt: serverTimestamp(), reviewedBy: user!.uid });
      setStories((prev) => prev.filter((x) => x.id !== s.id));
    }, status === "published" ? "Story published." : "Story not published.");

  const reviewGroup = (g: Group, status: "approved" | "rejected") =>
    run(async () => {
      await updateDoc(doc(db, "groups", g.id), { status, reviewedAt: serverTimestamp(), reviewedBy: user!.uid });
      setPendingGroups((prev) => prev.filter((x) => x.id !== g.id));
      if (status === "approved") setApprovedGroups((prev) => [...prev, g]);
    }, status === "approved" ? "Group approved. Open its chat under Live rooms when you are ready to watch it." : "Group not approved.");

  function deleteGroup(g: Group) {
    if (!window.confirm("Delete this group and all its messages? This cannot be undone.")) return;
    run(async () => {
      await purgeGroup(g.id);
      setApprovedGroups((prev) => prev.filter((x) => x.id !== g.id));
      if (liveRoom === g.id) setLiveRoom(null);
    }, "Group removed.");
  }

  const mute = (uid: string) =>
    run(async () => {
      await setDoc(doc(db, "muted", uid), { mutedAt: serverTimestamp(), mutedBy: user!.uid });
      setMuted((prev) => (prev.some((m) => m.id === uid) ? prev : [...prev, { id: uid, mutedAt: { seconds: Math.floor(Date.now() / 1000) } }]));
    }, "Muted. They can no longer post messages, stories or groups.");

  const unmute = (uid: string) =>
    run(async () => {
      await deleteDoc(doc(db, "muted", uid));
      setMuted((prev) => prev.filter((m) => m.id !== uid));
    }, "Unmuted.");

  const deleteMessage = (roomId: string, id: string) =>
    run(async () => {
      await deleteDoc(doc(db, "rooms", roomId, "messages", id));
    });

  const actOnReport = (r: Report, action: ReportAction) =>
    run(async () => {
      if (action !== "dismiss") {
        if (r.kind === "story") await deleteDoc(doc(db, "stories", r.targetId));
        else if (r.kind === "message" && r.roomId) await deleteDoc(doc(db, "rooms", r.roomId, "messages", r.targetId));
        else if (r.kind === "group") await purgeGroup(r.targetId);
      }
      if (action === "remove-mute" && r.authorUid) {
        await setDoc(doc(db, "muted", r.authorUid), { mutedAt: serverTimestamp(), mutedBy: user!.uid });
      }
      await deleteDoc(doc(db, "reports", r.id));
      await loadAll();
    }, "Done.");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "stories", label: "Stories to review", count: stories.length },
    { key: "groups", label: "Groups to review", count: pendingGroups.length },
    { key: "rooms", label: "Live rooms" },
    { key: "reports", label: "Reports", count: reports.length },
    { key: "muted", label: "Muted", count: muted.length },
  ];

  return (
    <StaffShell title="Community moderation" subtitle="Keep the community safe: review stories and groups, watch rooms and act on reports.">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-notice-bg text-notice-text max-w-3xl">
        <ShieldAlert size={20} className="shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          Before publishing a story or approving a group, check it for names, places, phone numbers or anything
          that could identify someone. Reject groups that look like advertising, recruiting, or an attempt to
          get people to make contact outside this site. Open a live room or group only while you are watching it.
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

      {tab === "stories" && <StoriesPanel stories={stories} onReview={reviewStory} />}
      {tab === "groups" && <GroupsPanel groups={pendingGroups} onReview={reviewGroup} />}
      {tab === "rooms" && (
        <RoomsPanel
          settings={settings}
          groups={approvedGroups}
          liveRoom={liveRoom}
          live={live}
          onToggle={setRoomOpen}
          onWatch={setLiveRoom}
          onDeleteGroup={deleteGroup}
          onDeleteMessage={deleteMessage}
          onMute={mute}
        />
      )}
      {tab === "reports" && <ReportsPanel reports={reports} onAct={actOnReport} />}
      {tab === "muted" && <MutedPanel muted={muted} onUnmute={unmute} />}
    </StaffShell>
  );
}
