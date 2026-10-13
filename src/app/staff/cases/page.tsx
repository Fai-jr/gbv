"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { Plus, Info } from "lucide-react";

const STATUSES = ["open", "in progress", "closed"];

const STATUS_STYLE: Record<string, string> = {
  open: "bg-notice-bg text-notice-text",
  "in progress": "bg-primary-fixed text-on-primary-fixed",
  closed: "bg-surface-container-high text-on-surface-variant",
};

type CaseDoc = {
  id: string;
  caseCode: string;
  incidentType: string;
  ageGroup: string;
  servicesProvided?: string[];
  notes?: string;
  status: string;
  createdAt?: { seconds: number };
};

export default function CasesPage() {
  const { profile, loading } = useAuth();
  const orgId = profile?.orgId;
  const [cases, setCases] = useState<CaseDoc[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!orgId) {
      setFetching(false);
      return;
    }
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, "cases"), where("orgId", "==", orgId)));
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CaseDoc, "id">) }));
        list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setCases(list);
      } catch (err) {
        console.error("Failed to load cases:", err);
        setError("Could not load cases. Please refresh.");
      }
      setFetching(false);
    }
    load();
  }, [loading, orgId]);

  async function changeStatus(id: string, newStatus: string) {
    try {
      await updateDoc(doc(db, "cases", id), { status: newStatus });
      setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Could not update that case. Please try again.");
    }
  }

  const visible = filter === "all" ? cases : cases.filter((c) => c.status === filter);

  return (
    <StaffShell orgOnly
      title="Cases"
      subtitle="Cases recorded by your organisation. Each one is tracked by code only."
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
          <p className="text-sm text-on-surface-variant">
            Cases belong to an organisation. This account is not attached to one, so there is nothing to show here.
          </p>
        </div>
      )}

      {orgId && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["all", ...STATUSES].map((s) => {
              const count = s === "all" ? cases.length : cases.filter((c) => c.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={
                    "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold shadow-sm capitalize transition-all " +
                    (filter === s
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface")
                  }
                >
                  {s} ({count})
                </button>
              );
            })}
          </div>

          {fetching && <p className="text-on-surface-variant">Loading...</p>}
          {!fetching && visible.length === 0 && (
            <p className="text-center text-on-surface-variant py-8">No cases to show.</p>
          )}

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visible.map((c) => (
              <li key={c.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-semibold text-primary">{c.caseCode}</span>
                  <span className={"px-3 py-1 rounded-full text-xs font-semibold capitalize " + (STATUS_STYLE[c.status] || STATUS_STYLE.closed)}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant capitalize">
                  {c.incidentType}, {c.ageGroup}
                  {c.createdAt ? " \u2022 " + new Date(c.createdAt.seconds * 1000).toLocaleDateString() : ""}
                </p>
                {c.servicesProvided && c.servicesProvided.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.servicesProvided.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-surface-container text-xs text-on-surface-variant capitalize">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {c.notes && <p className="text-sm text-on-surface bg-surface-container-low rounded-xl p-3">{c.notes}</p>}
                <div className="mt-auto flex flex-col gap-1.5">
                  <label htmlFor={"status-" + c.id} className="text-xs text-on-surface-variant font-semibold">Status</label>
                  <select
                    id={"status-" + c.id}
                    value={c.status}
                    onChange={(e) => changeStatus(c.id, e.target.value)}
                    className="h-11 rounded-xl border border-border-soft bg-card px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </StaffShell>
  );
}
