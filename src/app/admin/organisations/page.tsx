"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { Building2, Plus, Pencil, Ban, RotateCcw, X, Info } from "lucide-react";

const REGIONS = [
  "Centre", "Littoral", "Far North", "North", "Adamawa",
  "West", "North-West", "South-West", "East", "South", "National",
];

const ROLE_LABEL: Record<string, string> = {
  ngo_staff: "NGO staff",
  shelter_staff: "Shelter staff",
};

type Org = { id: string; name: string; region: string; active: boolean };
type Member = { id: string; email?: string; role: string; orgId?: string };
type Drawer = { mode: "create" | "edit"; lockCode: boolean } | null;

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const inputClass =
  "w-full h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

export default function OrganisationsPage() {
  const { user, profile, loading } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [fetching, setFetching] = useState(true);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [region, setRegion] = useState(REGIONS[0]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      const [oSnap, uSnap] = await Promise.all([
        getDocs(collection(db, "organisations")),
        getDocs(query(collection(db, "users"), where("role", "!=", "survivor"))),
      ]);
      const list = oSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Org, "id">) }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setOrgs(list);
      setMembers(uSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Member, "id">) })));
    } catch (err) {
      console.error("Failed to load organisations:", err);
      setError("Could not load organisations. Please refresh.");
    }
    setFetching(false);
  }

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;
    loadAll();
  }, [loading, profile]);

  const staffByOrg = useMemo(() => {
    const map: Record<string, Member[]> = {};
    members
      .filter((m) => m.role !== "admin" && m.orgId)
      .forEach((m) => {
        const key = m.orgId as string;
        if (!map[key]) map[key] = [];
        map[key].push(m);
      });
    return map;
  }, [members]);

  const unlinked = useMemo(
    () => Object.keys(staffByOrg).filter((id) => !orgs.some((o) => o.id === id)).sort(),
    [staffByOrg, orgs]
  );

  function openCreate(prefill?: string) {
    setName("");
    setCode(prefill || "");
    setCodeTouched(!!prefill);
    setRegion(REGIONS[0]);
    setFormError("");
    setDrawer({ mode: "create", lockCode: !!prefill });
  }

  function openEdit(o: Org) {
    setName(o.name);
    setCode(o.id);
    setCodeTouched(true);
    setRegion(o.region);
    setFormError("");
    setDrawer({ mode: "edit", lockCode: true });
  }

  function changeName(v: string) {
    setName(v);
    if (drawer?.mode === "create" && !codeTouched) setCode(slugify(v));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !drawer) return;
    setFormError("");
    const n = name.trim();
    if (n.length < 2) return setFormError("Please enter the organisation's name.");
    if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(code)) {
      return setFormError("The code must be 3 to 40 characters: lowercase letters, numbers and hyphens only.");
    }
    setSaving(true);
    try {
      if (drawer.mode === "create") {
        const existing = await getDoc(doc(db, "organisations", code));
        if (existing.exists()) {
          setFormError("An organisation with this code already exists.");
          setSaving(false);
          return;
        }
        await setDoc(doc(db, "organisations", code), {
          name: n,
          region,
          active: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        });
        setMessage(n + " was created.");
      } else {
        await updateDoc(doc(db, "organisations", code), { name: n, region });
        setMessage(n + " was updated.");
      }
      setDrawer(null);
      await loadAll();
    } catch (err) {
      console.error("Failed to save organisation:", err);
      setFormError("Could not save. Please try again.");
    }
    setSaving(false);
  }

  async function setActive(o: Org, active: boolean) {
    setError("");
    setMessage("");
    const count = (staffByOrg[o.id] || []).length;
    if (
      !active &&
      !window.confirm(
        "Suspend " + o.name + "? Its " + count + " staff member(s) will immediately lose access to cases, shelters, listings and community moderation. No data is deleted, and you can reactivate it at any time."
      )
    ) {
      return;
    }
    try {
      await updateDoc(doc(db, "organisations", o.id), { active });
      if (!active) {
        const snap = await getDocs(query(collection(db, "publicShelters"), where("orgId", "==", o.id)));
        await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      }
      setOrgs((prev) => prev.map((x) => (x.id === o.id ? { ...x, active } : x)));
      setMessage(o.name + (active ? " is active again." : " is suspended."));
    } catch (err) {
      console.error("Failed to change status:", err);
      setError("Could not change that. Please try again.");
    }
  }

  return (
    <StaffShell
      title="Organisations"
      subtitle="The partner organisations whose staff use GBVConnect."
      adminOnly
      actions={
        <button
          onClick={() => openCreate()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add organisation
        </button>
      }
    >
      {error && <p className="text-sm text-error font-semibold">{error}</p>}
      {message && <p className="text-sm text-available-text font-semibold">{message}</p>}

      {unlinked.length > 0 && (
        <section className="rounded-xl bg-notice-bg text-notice-text p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Info size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Some staff already use these organisation codes, but there is no organisation record for them yet.
              They work as before, but you cannot rename or suspend them until you create a record.
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {unlinked.map((id) => (
              <li key={id} className="flex flex-wrap items-center justify-between gap-2 bg-surface-container-lowest/70 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold">
                  {id} <span className="font-normal">({staffByOrg[id].length} staff)</span>
                </span>
                <button
                  onClick={() => openCreate(id)}
                  className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors"
                >
                  Create record
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {fetching && <p className="text-on-surface-variant">Loading...</p>}
      {!fetching && orgs.length === 0 && (
        <p className="text-on-surface-variant">No organisations yet. Add the first one.</p>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {orgs.map((o) => {
          const staff = staffByOrg[o.id] || [];
          return (
            <li key={o.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Building2 size={22} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-primary truncate">{o.name}</h2>
                    <p className="text-xs text-on-surface-variant">
                      {o.id} &bull; {o.region}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    "px-3 py-1 rounded-full text-xs font-semibold shrink-0 " +
                    (o.active ? "bg-available-bg text-available-text" : "bg-full-bg text-full-text")
                  }
                >
                  {o.active ? "Active" : "Suspended"}
                </span>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-primary font-semibold">
                  {staff.length} staff member{staff.length === 1 ? "" : "s"}
                </summary>
                {staff.length === 0 ? (
                  <p className="text-on-surface-variant mt-2">Nobody yet. Approve staff under Staff accounts.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 text-on-surface-variant">
                    {staff.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-2 bg-surface-container-low rounded-lg px-3 py-1.5">
                        <span className="truncate">{m.email || "Account " + m.id.slice(0, 8)}</span>
                        <span className="text-xs shrink-0">{ROLE_LABEL[m.role] || m.role}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </details>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => openEdit(o)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                {o.active ? (
                  <button
                    onClick={() => setActive(o, false)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80 transition-opacity"
                  >
                    <Ban size={16} />
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => setActive(o, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-available-bg text-available-text text-sm font-semibold hover:opacity-80 transition-opacity"
                  >
                    <RotateCcw size={16} />
                    Reactivate
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#292524]/40" onClick={() => setDrawer(null)} />
          <form
            onSubmit={submit}
            className="relative w-full max-w-md h-full bg-surface-container-lowest shadow-[0_12px_32px_-4px_rgba(74,59,82,0.12)] p-6 overflow-y-auto flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  {drawer.mode === "create" ? "Add an organisation" : "Edit organisation"}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {drawer.mode === "create" && drawer.lockCode
                    ? "Staff already use this code. Creating the record connects them to it."
                    : "The code is permanent and cannot be changed later."}
                </p>
              </div>
              <button type="button" onClick={() => setDrawer(null)} aria-label="Close" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="o-name" className="text-sm font-semibold text-on-surface">Name</label>
              <input id="o-name" value={name} onChange={(e) => changeName(e.target.value)} maxLength={80} placeholder="e.g. ALVF Yaoundé" className={inputClass} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="o-code" className="text-sm font-semibold text-on-surface">Code</label>
              <input
                id="o-code"
                value={code}
                onChange={(e) => {
                  setCodeTouched(true);
                  setCode(slugify(e.target.value));
                }}
                disabled={drawer.lockCode}
                maxLength={40}
                placeholder="alvf-yaounde"
                className={inputClass + " disabled:opacity-60"}
                required
              />
              <span className="text-xs text-on-surface-variant">Lowercase letters, numbers and hyphens. Used internally to link staff, cases and shelters.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="o-region" className="text-sm font-semibold text-on-surface">Region</label>
              <select id="o-region" value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass}>
                {(REGIONS.includes(region) ? REGIONS : [region, ...REGIONS]).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {formError && <p className="text-sm text-error font-semibold">{formError}</p>}

            <div className="flex gap-2 mt-auto pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : drawer.mode === "create" ? "Create organisation" : "Save changes"}
              </button>
              <button type="button" onClick={() => setDrawer(null)} className="px-5 h-[52px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </StaffShell>
  );
}
