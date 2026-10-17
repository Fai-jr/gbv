"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import AdminOverview from "@/components/AdminOverview";
import {
  Home as HomeIcon,
  FolderOpen,
  BedDouble,
  CircleSlash,
  Clock,
  Plus,
  ArrowRight,
  Store,
  GraduationCap,
  Info,
} from "lucide-react";

type Shelter = {
  id: string;
  name: string;
  capacity?: number;
  occupied?: number;
  capacityStatus?: "available" | "full";
};
type CaseRow = {
  id: string;
  caseCode: string;
  incidentType: string;
  ageGroup: string;
  status: string;
  createdAt?: { seconds: number };
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-notice-bg text-notice-text",
  "in progress": "bg-primary-fixed text-on-primary-fixed",
  closed: "bg-surface-container-high text-on-surface-variant",
};

function StatCard({
  label,
  value,
  note,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  note: string;
  tone: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div className={"rounded-xl p-5 shadow-sm flex flex-col gap-2 " + tone}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-bold opacity-80">{label}</span>
        <Icon size={20} />
      </div>
      <span className="text-4xl font-semibold font-serif">{value}</span>
      <span className="text-sm opacity-80">{note}</span>
    </div>
  );
}

export default function StaffDashboard() {
  const { profile, loading } = useAuth();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const orgId = profile?.orgId;

  useEffect(() => {
    if (loading) return;
    if (!orgId) {
      setFetching(false);
      return;
    }
    async function load() {
      try {
        const [shSnap, caseSnap] = await Promise.all([
          getDocs(query(collection(db, "shelters"), where("orgId", "==", orgId))),
          getDocs(query(collection(db, "cases"), where("orgId", "==", orgId))),
        ]);
        setShelters(shSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Shelter, "id">) })));
        const list = caseSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CaseRow, "id">) }));
        list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setCases(list);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError("Could not load your organisation's data. Please refresh.");
      }
      setFetching(false);
    }
    load();
  }, [loading, orgId]);

  const spacesLeft = shelters.reduce(
    (sum, s) => (typeof s.capacity === "number" ? sum + Math.max(0, s.capacity - (s.occupied ?? 0)) : sum),
    0
  );
  const full = shelters.filter((s) => s.capacityStatus === "full").length;
  const openCases = cases.filter((c) => c.status === "open").length;
  const inProgress = cases.filter((c) => c.status === "in progress").length;

  if (profile?.role === "admin") return <AdminOverview />;

  return (
    <StaffShell
      title="Dashboard"
      subtitle={orgId ? "Your organisation's overview" : "Administrator account"}
      actions={
        orgId ? (
          <Link href="/staff/cases/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors shadow-sm">
            <Plus size={18} />
            New case
          </Link>
        ) : null
      }
    >
      {error && <p className="text-sm text-error font-semibold">{error}</p>}

      {!orgId && (
        <div className="rounded-xl bg-surface-container p-5 flex items-start gap-3">
          <Info size={22} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant leading-relaxed">
            This administrator account is not attached to an organisation, so cases and shelters are not
            shown here. Use the admin tools in the menu to manage verified contacts, approve staff and review
            feedback.
          </p>
        </div>
      )}

      {orgId && (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Spaces left" value={fetching ? "-" : spacesLeft} note="Across shelters with a set capacity" tone="bg-available-bg text-available-text" icon={BedDouble} />
            <StatCard label="Shelters full" value={fetching ? "-" : full} note="Not taking new arrivals" tone="bg-full-bg text-full-text" icon={CircleSlash} />
            <StatCard label="Open cases" value={fetching ? "-" : openCases} note="Waiting for first action" tone="bg-surface-container-lowest text-primary" icon={FolderOpen} />
            <StatCard label="In progress" value={fetching ? "-" : inProgress} note="Being actively supported" tone="bg-surface-container-lowest text-primary" icon={Clock} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Shelter spaces</h2>
                <Link href="/staff/shelter" className="text-sm font-semibold text-primary hover:underline">
                  Manage shelters
                </Link>
              </div>
              {fetching && <p className="text-sm text-on-surface-variant">Loading...</p>}
              {!fetching && shelters.length === 0 && (
                <p className="text-sm text-on-surface-variant">
                  No shelters added yet for your organisation. Shelter staff can add them under Shelters.
                </p>
              )}
              <ul className="flex flex-col gap-3">
                {shelters.map((s) => {
                  const hasNumbers = typeof s.capacity === "number";
                  const cap = s.capacity ?? 0;
                  const occ = s.occupied ?? 0;
                  const left = Math.max(0, cap - occ);
                  const percent = cap > 0 ? Math.min(100, Math.round((occ / cap) * 100)) : 0;
                  const isFull = hasNumbers ? left === 0 : s.capacityStatus === "full";
                  return (
                    <li key={s.id} className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
                            <HomeIcon size={20} />
                          </div>
                          <span className="font-semibold text-on-surface truncate">{s.name}</span>
                        </div>
                        <span
                          className={
                            "px-3 py-1 rounded-full text-xs font-semibold border shrink-0 " +
                            (isFull
                              ? "bg-full-bg text-full-text border-full-border"
                              : "bg-available-bg text-available-text border-available-border")
                          }
                        >
                          {hasNumbers ? (isFull ? "Full" : left + " left") : isFull ? "Full" : "Available"}
                        </span>
                      </div>
                      {hasNumbers ? (
                        <div className="flex flex-col gap-1">
                          <div className="h-2.5 rounded-full bg-surface-container overflow-hidden">
                            <div
                              className={"h-full rounded-full " + (isFull ? "bg-full-text" : percent >= 80 ? "bg-notice-text" : "bg-available-text")}
                              style={{ width: percent + "%" }}
                            />
                          </div>
                          <span className="text-xs text-on-surface-variant">{occ} of {cap} occupied</span>
                        </div>
                      ) : (
                        <span className="text-xs text-notice-text">Capacity not set yet. Open Manage shelters to set it.</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Recent cases</h2>
                <Link href="/staff/cases" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>
              {fetching && <p className="text-sm text-on-surface-variant">Loading...</p>}
              {!fetching && cases.length === 0 && (
                <p className="text-sm text-on-surface-variant">No cases recorded yet.</p>
              )}
              <ul className="flex flex-col gap-3">
                {cases.slice(0, 5).map((c) => (
                  <li key={c.id} className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-primary">{c.caseCode}</span>
                      <span className={"px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize " + (STATUS_STYLE[c.status] || STATUS_STYLE.closed)}>
                        {c.status}
                      </span>
                    </div>
                    <span className="text-sm text-on-surface-variant capitalize">
                      {c.incidentType}, {c.ageGroup}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/staff/training" className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="font-semibold text-primary">Staff training</p>
            <p className="text-sm text-on-surface-variant">First-response guidance and safeguarding.</p>
          </div>
        </Link>
        <Link href="/staff/marketplace" className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <Store size={22} />
          </div>
          <div>
            <p className="font-semibold text-primary">Marketplace listings</p>
            <p className="text-sm text-on-surface-variant">Add or review items from your organisation.</p>
          </div>
        </Link>
      </section>
    </StaffShell>
  );
}
