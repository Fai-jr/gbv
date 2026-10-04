"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import {
  Home as HomeIcon,
  FolderOpen,
  CircleCheck,
  CircleSlash,
  Clock,
  Plus,
  ArrowRight,
  Store,
  GraduationCap,
  Info,
  RefreshCw,
} from "lucide-react";

type Shelter = { id: string; name: string; capacityStatus: "available" | "full" };
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
  const canToggle = profile?.role === "shelter_staff" || profile?.role === "admin";

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

  async function toggle(s: Shelter) {
    const next = s.capacityStatus === "available" ? "full" : "available";
    try {
      await updateDoc(doc(db, "shelters", s.id), { capacityStatus: next });
      setShelters((prev) => prev.map((x) => (x.id === s.id ? { ...x, capacityStatus: next } : x)));
    } catch (err) {
      console.error("Could not update shelter:", err);
      setError("Could not update that shelter. Please try again.");
    }
  }

  const available = shelters.filter((s) => s.capacityStatus === "available").length;
  const full = shelters.filter((s) => s.capacityStatus === "full").length;
  const openCases = cases.filter((c) => c.status === "open").length;
  const inProgress = cases.filter((c) => c.status === "in progress").length;

  return (
    <StaffShell
      title="Dashboard"
      subtitle={orgId ? "Organisation: " + orgId : "Administrator account"}
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
            <StatCard label="Shelters available" value={fetching ? "-" : available} note="Marked as taking people" tone="bg-available-bg text-available-text" icon={CircleCheck} />
            <StatCard label="Shelters full" value={fetching ? "-" : full} note="Not taking new arrivals" tone="bg-full-bg text-full-text" icon={CircleSlash} />
            <StatCard label="Open cases" value={fetching ? "-" : openCases} note="Waiting for first action" tone="bg-surface-container-lowest text-primary" icon={FolderOpen} />
            <StatCard label="In progress" value={fetching ? "-" : inProgress} note="Being actively supported" tone="bg-surface-container-lowest text-primary" icon={Clock} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Shelter availability</h2>
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
                  const isAvailable = s.capacityStatus === "available";
                  return (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                          <HomeIcon size={20} />
                        </div>
                        <span className="font-semibold text-on-surface">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            "px-3 py-1 rounded-full text-xs font-semibold border " +
                            (isAvailable
                              ? "bg-available-bg text-available-text border-available-border"
                              : "bg-full-bg text-full-text border-full-border")
                          }
                        >
                          {isAvailable ? "Available" : "Full"}
                        </span>
                        {canToggle && (
                          <button
                            onClick={() => toggle(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary text-sm font-semibold shadow-sm hover:bg-surface-container transition-colors"
                          >
                            <RefreshCw size={14} />
                            Mark as {isAvailable ? "full" : "available"}
                          </button>
                        )}
                      </div>
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
