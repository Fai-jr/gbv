"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, deleteField, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { Check, X, Pencil, UserX, RotateCcw, Info } from "lucide-react";

const ASSIGNABLE = ["ngo_staff", "shelter_staff", "admin"];
const ROLE_LABEL: Record<string, string> = {
  ngo_staff: "NGO staff",
  shelter_staff: "Shelter staff",
  admin: "Administrator",
};

type UserDoc = {
  id: string;
  role: string;
  email?: string;
  orgId?: string;
  createdAt?: string;
  revoked?: boolean;
  revokedAt?: { seconds: number };
};

type Draft = { role: string; orgId: string };

const inputClass =
  "w-full h-[48px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

function normaliseOrg(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, "-");
}

function nameOf(u: UserDoc) {
  return u.email || "Account " + u.id.slice(0, 8);
}

export default function AdminStaffPage() {
  const { user, profile, loading } = useAuth();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [fetching, setFetching] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orgs, setOrgs] = useState<{ id: string; name: string; active: boolean }[]>([]);

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;
    async function load() {
      try {
        const [staffSnap, emailSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "!=", "survivor"))),
          getDocs(query(collection(db, "users"), where("email", ">", ""))),
        ]);
        const map = new Map<string, UserDoc>();
        [...staffSnap.docs, ...emailSnap.docs].forEach((d) =>
          map.set(d.id, { id: d.id, ...(d.data() as Omit<UserDoc, "id">) })
        );
        setUsers(Array.from(map.values()));
      } catch (err) {
        console.error("Failed to load accounts:", err);
        setError("Could not load accounts. Please refresh.");
      }
      setFetching(false);
    }
    load();
  }, [loading, profile]);

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;
    getDocs(collection(db, "organisations"))
      .then((snap) =>
        setOrgs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as { name: string; active: boolean }) })))
      )
      .catch((err) => console.error("Failed to load organisations:", err));
  }, [loading, profile]);

  const pending = useMemo(() => users.filter((u) => u.role === "survivor" && u.email && !u.revoked), [users]);
  const active = useMemo(
    () => users.filter((u) => u.role !== "survivor").sort((a, b) => nameOf(a).localeCompare(nameOf(b))),
    [users]
  );
  const former = useMemo(() => users.filter((u) => u.role === "survivor" && u.email && u.revoked), [users]);
  const orgSuggestions = useMemo(
    () => Array.from(new Set(active.map((u) => u.orgId).filter(Boolean) as string[])),
    [active]
  );

  function draftFor(u: UserDoc): Draft {
    return drafts[u.id] ?? { role: u.role !== "survivor" ? u.role : "ngo_staff", orgId: u.orgId ?? "" };
  }

  function setDraft(u: UserDoc, field: keyof Draft, value: string) {
    setDrafts((prev) => ({ ...prev, [u.id]: { ...draftFor(u), [field]: value } }));
  }

  function patchLocal(id: string, changes: Partial<UserDoc>) {
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, ...changes } : x)));
  }

  async function applyAccess(u: UserDoc) {
    setError("");
    setMessage("");
    const d = draftFor(u);
    const org = normaliseOrg(d.orgId);
    if (d.role !== "admin") {
      if (!org) {
        setError("Please enter an organisation for this role.");
        return;
      }
      if (!/^[a-z0-9-]+$/.test(org)) {
        setError("Organisation names can only use letters, numbers and hyphens.");
        return;
      }
    }
    setBusy(u.id);
    try {
      await updateDoc(doc(db, "users", u.id), {
        role: d.role,
        orgId: d.role === "admin" ? deleteField() : org,
        revoked: deleteField(),
        revokedAt: deleteField(),
      });
      patchLocal(u.id, {
        role: d.role,
        orgId: d.role === "admin" ? undefined : org,
        revoked: undefined,
        revokedAt: undefined,
      });
      setEditing(null);
      setMessage(nameOf(u) + " now has access as " + ROLE_LABEL[d.role] + ".");
    } catch (err) {
      console.error("Failed to update access:", err);
      setError("Could not save. Please try again.");
    }
    setBusy(null);
  }

  async function removeAccess(u: UserDoc) {
    setError("");
    setMessage("");
    if (!window.confirm("Remove staff access for " + nameOf(u) + "? They will no longer be able to see any organisation data.")) return;
    setBusy(u.id);
    try {
      await updateDoc(doc(db, "users", u.id), {
        role: "survivor",
        orgId: deleteField(),
        revoked: true,
        revokedAt: serverTimestamp(),
      });
      patchLocal(u.id, {
        role: "survivor",
        orgId: undefined,
        revoked: true,
        revokedAt: { seconds: Math.floor(Date.now() / 1000) },
      });
      setEditing(null);
      setMessage("Access removed for " + nameOf(u) + ".");
    } catch (err) {
      console.error("Failed to remove access:", err);
      setError("Could not remove access. Please try again.");
    }
    setBusy(null);
  }

  async function decline(u: UserDoc) {
    setError("");
    setMessage("");
    if (!window.confirm("Decline the request from " + nameOf(u) + "?")) return;
    setBusy(u.id);
    try {
      await updateDoc(doc(db, "users", u.id), { revoked: true, revokedAt: serverTimestamp() });
      patchLocal(u.id, { revoked: true, revokedAt: { seconds: Math.floor(Date.now() / 1000) } });
    } catch (err) {
      console.error("Failed to decline:", err);
      setError("Could not decline that request. Please try again.");
    }
    setBusy(null);
  }

  async function reconsider(u: UserDoc) {
    setError("");
    setMessage("");
    setBusy(u.id);
    try {
      await updateDoc(doc(db, "users", u.id), { revoked: deleteField(), revokedAt: deleteField() });
      patchLocal(u.id, { revoked: undefined, revokedAt: undefined });
      setMessage(nameOf(u) + " is back in pending requests.");
    } catch (err) {
      console.error("Failed to restore request:", err);
      setError("Could not do that. Please try again.");
    }
    setBusy(null);
  }

  function Controls({ u, label, onSave, onCancel }: { u: UserDoc; label: string; onSave: () => void; onCancel?: () => void }) {
    const d = draftFor(u);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={"role-" + u.id} className="text-xs font-semibold text-on-surface-variant">Role</label>
          <select id={"role-" + u.id} value={d.role} onChange={(e) => setDraft(u, "role", e.target.value)} className={inputClass}>
            {ASSIGNABLE.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
        </div>
        {d.role !== "admin" && (
          <div className="flex flex-col gap-1">
            <label htmlFor={"org-" + u.id} className="text-xs font-semibold text-on-surface-variant">Organisation</label>
            <select
              id={"org-" + u.id}
              value={d.orgId}
              onChange={(e) => setDraft(u, "orgId", e.target.value)}
              className={inputClass}
            >
              <option value="">Choose an organisation...</option>
              {orgs.filter((o) => o.active || o.id === d.orgId).map((o) => (
                <option key={o.id} value={o.id}>{o.name} ({o.id})</option>
              ))}
              {d.orgId && !orgs.some((o) => o.id === d.orgId) && (
                <option value={d.orgId}>{d.orgId} (no record yet)</option>
              )}
            </select>
            {orgs.length === 0 && (
              <span className="text-xs text-notice-text">No organisations yet. Create one under Organisations first.</span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={busy === u.id}
            className="flex-1 inline-flex items-center justify-center gap-2 h-[48px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
          >
            <Check size={18} />
            {busy === u.id ? "Saving..." : label}
          </button>
          {onCancel && (
            <button onClick={onCancel} className="px-4 h-[48px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <StaffShell
      title="Staff accounts"
      subtitle="Approve new staff, change roles, and remove access when someone leaves."
      adminOnly
    >
      <datalist id="org-suggestions">
        {orgSuggestions.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>

      {error && <p className="text-sm text-error font-semibold">{error}</p>}
      {message && <p className="text-sm text-available-text font-semibold">{message}</p>}

      <section className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-notice-bg text-notice-text p-5 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-bold opacity-80">Pending</span>
          <p className="text-4xl font-semibold font-serif mt-1">{fetching ? "-" : pending.length}</p>
        </div>
        <div className="rounded-xl bg-available-bg text-available-text p-5 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-bold opacity-80">Active staff</span>
          <p className="text-4xl font-semibold font-serif mt-1">{fetching ? "-" : active.length}</p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest text-primary p-5 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Removed</span>
          <p className="text-4xl font-semibold font-serif mt-1">{fetching ? "-" : former.length}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-primary">Pending requests</h2>
        {!fetching && pending.length === 0 && <p className="text-sm text-on-surface-variant">No pending requests.</p>}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pending.map((u) => (
            <li key={u.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-4">
              <div>
                <p className="font-semibold text-primary break-all">{nameOf(u)}</p>
                {u.createdAt && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Requested {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Controls u={u} label="Approve" onSave={() => applyAccess(u)} />
              <button
                onClick={() => decline(u)}
                disabled={busy === u.id}
                className="inline-flex items-center justify-center gap-2 h-[44px] rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <X size={16} />
                Decline request
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-primary">Active staff</h2>
        {!fetching && active.length === 0 && <p className="text-sm text-on-surface-variant">No staff accounts yet.</p>}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {active.map((u) => {
            const isMe = u.id === user?.uid;
            return (
              <li key={u.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary break-all">
                      {nameOf(u)}
                      {isMe && <span className="ml-2 text-xs font-semibold text-tertiary">(you)</span>}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {ROLE_LABEL[u.role] || u.role}
                      {u.orgId ? " \u2022 " + u.orgId : ""}
                    </p>
                  </div>
                </div>

                {editing === u.id ? (
                  <Controls u={u} label="Save changes" onSave={() => applyAccess(u)} onCancel={() => setEditing(null)} />
                ) : isMe ? (
                  <p className="text-xs text-on-surface-variant flex items-start gap-1.5">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    You can&apos;t change or remove your own access.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setEditing(u.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
                    >
                      <Pencil size={16} />
                      Change role or organisation
                    </button>
                    <button
                      onClick={() => removeAccess(u)}
                      disabled={busy === u.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      <UserX size={16} />
                      Remove access
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {former.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-primary">Removed or declined</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {former.map((u) => (
              <li key={u.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
                <div>
                  <p className="font-semibold text-primary break-all">{nameOf(u)}</p>
                  {u.revokedAt && (
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(u.revokedAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => reconsider(u)}
                  disabled={busy === u.id}
                  className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Review again
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-on-surface-variant max-w-2xl">
        Removing access stops someone seeing any organisation data straight away, but their login still
        exists. To delete it completely, remove the account in Firebase console, under Authentication.
      </p>
    </StaffShell>
  );
}
