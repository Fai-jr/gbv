"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const STAFF_ROLES = ["ngo_staff", "shelter_staff", "admin"];
const STATUSES = ["open", "in progress", "closed"];

type CaseDoc = {
  id: string;
  caseCode: string;
  incidentType: string;
  ageGroup: string;
  servicesProvided: string[];
  notes: string;
  status: string;
  createdAt?: { seconds: number };
};

export default function CasesPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CaseDoc[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!profile || !STAFF_ROLES.includes(profile.role))) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  useEffect(() => {
    if (loading || !profile?.orgId) return;

    async function fetchCases() {
      const q = query(collection(db, "cases"), where("orgId", "==", profile!.orgId));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CaseDoc, "id">) }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setCases(list);
      setFetching(false);
    }

    fetchCases();
  }, [loading, profile]);

  async function changeStatus(id: string, newStatus: string) {
    await updateDoc(doc(db, "cases", id), { status: newStatus });
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  }

  if (loading || !profile) return <p className="p-8">Loading...</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-lg font-medium text-ink">Cases</h1>

      <button
        onClick={() => router.push("/staff/cases/new")}
        className="mb-4 w-full rounded bg-plum py-2 text-sm font-medium text-white hover:bg-plum-dark"
      >
        + New case
      </button>

      {fetching && <p className="text-sm text-muted">Loading...</p>}
      {!fetching && cases.length === 0 && (
        <p className="text-sm text-muted">No cases recorded yet.</p>
      )}

      <ul className="space-y-3">
        {cases.map((c) => (
          <li key={c.id} className="rounded-lg border border-border-soft bg-card p-4 shadow-sm">
            <p className="font-medium text-ink">{c.caseCode}</p>
            <p className="text-sm text-muted">
              {c.incidentType}, {c.ageGroup}
            </p>
            {c.servicesProvided?.length > 0 && (
              <p className="mt-1 text-sm text-muted">
                Services: {c.servicesProvided.join(", ")}
              </p>
            )}
            {c.notes && <p className="mt-2 text-sm text-ink">{c.notes}</p>}

            <label htmlFor={"status-" + c.id} className="mt-3 block text-xs text-muted">
              Status
            </label>
            <select
              id={"status-" + c.id}
              value={c.status}
              onChange={(e) => changeStatus(c.id, e.target.value)}
              className="mt-1 w-full rounded border border-border-soft px-2 py-1 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
