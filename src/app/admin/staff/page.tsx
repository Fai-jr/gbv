"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const ASSIGNABLE_ROLES = ["ngo_staff", "shelter_staff", "admin"];

type UserDoc = {
  id: string;
  role: string;
  email?: string;
  orgId?: string;
};

export default function AdminStaffPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selections, setSelections] = useState<Record<string, { role: string; orgId: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "admin")) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;

    async function fetchUsers() {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<UserDoc, "id">) }))
        .filter((u) => !!u.email);
      setUsers(list);
      setFetching(false);
    }

    fetchUsers();
  }, [loading, profile]);

  function updateSelection(uid: string, field: "role" | "orgId", value: string) {
    setSelections((prev) => ({
      ...prev,
      [uid]: {
        role: prev[uid]?.role ?? "ngo_staff",
        orgId: prev[uid]?.orgId ?? "",
        [field]: value,
      },
    }));
  }

  async function approve(u: UserDoc) {
    const sel = selections[u.id];
    const role = sel?.role ?? "ngo_staff";
    const orgId = sel?.orgId?.trim();
    if (role !== "admin" && !orgId) {
      alert("Please enter an organisation ID for this role.");
      return;
    }
    setSaving(u.id);
    try {
      const data: Record<string, string> = { role };
      if (orgId) data.orgId = orgId;
      await updateDoc(doc(db, "users", u.id), data);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role, orgId } : x)));
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Could not save. Please try again.");
    }
    setSaving(null);
  }

  if (loading || !profile) return <p className="p-8">Loading...</p>;

  const pending = users.filter((u) => u.role === "survivor");
  const approved = users.filter((u) => u.role !== "survivor");

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-lg font-medium text-ink">Staff Accounts</h1>

      <h2 className="mb-2 text-sm font-medium text-ink">Pending requests</h2>
      {fetching && <p className="text-sm text-muted">Loading...</p>}
      {!fetching && pending.length === 0 && (
        <p className="mb-4 text-sm text-muted">No pending requests.</p>
      )}
      <ul className="mb-6 space-y-3">
        {pending.map((u) => {
          const sel = selections[u.id] ?? { role: "ngo_staff", orgId: "" };
          return (
            <li key={u.id} className="rounded-lg border border-border-soft bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-ink">{u.email}</p>

              <label htmlFor={"role-" + u.id} className="mt-2 block text-xs text-muted">
                Assign role
              </label>
              <select
                id={"role-" + u.id}
                value={sel.role}
                onChange={(e) => updateSelection(u.id, "role", e.target.value)}
                className="mt-1 w-full rounded border border-border-soft px-2 py-1 text-sm"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {sel.role !== "admin" && (
                <>
                  <label htmlFor={"org-" + u.id} className="mt-2 block text-xs text-muted">
                    Organisation ID
                  </label>
                  <input
                    id={"org-" + u.id}
                    value={sel.orgId}
                    onChange={(e) => updateSelection(u.id, "orgId", e.target.value)}
                    placeholder="e.g. alvf-yaounde"
                    className="mt-1 w-full rounded border border-border-soft px-2 py-1 text-sm"
                  />
                </>
              )}

              <button
                onClick={() => approve(u)}
                disabled={saving === u.id}
                className="mt-3 w-full rounded bg-plum py-2 text-sm font-medium text-white hover:bg-plum-dark disabled:opacity-50"
              >
                {saving === u.id ? "Saving..." : "Approve"}
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-2 text-sm font-medium text-ink">Approved staff</h2>
      {!fetching && approved.length === 0 && (
        <p className="text-sm text-muted">No approved staff yet.</p>
      )}
      <ul className="space-y-2">
        {approved.map((u) => (
          <li key={u.id} className="rounded-lg border border-border-soft bg-card p-3 text-sm">
            <p className="font-medium text-ink">{u.email}</p>
            <p className="text-muted">
              {u.role}
              {u.orgId ? " - " + u.orgId : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
