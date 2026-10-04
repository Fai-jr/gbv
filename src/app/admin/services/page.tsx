"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import {
  Plus,
  Download,
  Search,
  MapPin,
  Phone,
  PhoneCall,
  Pencil,
  Trash2,
  X,
  BadgeCheck,
  Clock,
  TriangleAlert,
} from "lucide-react";

const TYPES = ["hotline", "legal aid", "medical", "psychosocial", "shelter"];
const REGIONS = [
  "Centre", "Littoral", "Far North", "North", "Adamawa",
  "West", "North-West", "South-West", "East", "South", "National",
];
const STALE_DAYS = 90;

type Service = {
  id: string;
  name: string;
  type: string;
  phone: string;
  region: string;
  verifiedAt?: { seconds: number };
};

function daysSince(ts?: { seconds: number }) {
  if (!ts) return null;
  return Math.floor((Date.now() / 1000 - ts.seconds) / 86400);
}

const inputClass =
  "w-full h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

export default function AdminServicesPage() {
  const { user, profile, loading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [phone, setPhone] = useState("");
  const [serviceRegion, setServiceRegion] = useState(REGIONS[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchServices() {
    const snap = await getDocs(collection(db, "services"));
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) }));
    list.sort((a, b) => a.name.localeCompare(b.name));
    setServices(list);
    setFetching(false);
  }

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;
    fetchServices();
  }, [loading, profile]);

  const stats = useMemo(() => {
    const fresh = services.filter((s) => {
      const d = daysSince(s.verifiedAt);
      return d !== null && d <= STALE_DAYS;
    }).length;
    return {
      total: services.length,
      fresh,
      stale: services.length - fresh,
      regions: new Set(services.map((s) => s.region.toLowerCase())).size,
    };
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchCat = category === "all" || s.type === category;
      const matchRegion = region === "all" || s.region.toLowerCase().includes(region.toLowerCase());
      const q = query.toLowerCase();
      const matchQuery = !q || (s.name + " " + s.region + " " + s.phone).toLowerCase().includes(q);
      return matchCat && matchRegion && matchQuery;
    });
  }, [services, category, region, query]);

  function openAdd() {
    setEditingId(null);
    setName("");
    setType(TYPES[0]);
    setPhone("");
    setServiceRegion(REGIONS[0]);
    setConfirmed(false);
    setFormError("");
    setDrawerOpen(true);
  }

  function openEdit(s: Service) {
    setEditingId(s.id);
    setName(s.name);
    setType(s.type);
    setPhone(s.phone);
    setServiceRegion(s.region);
    setConfirmed(false);
    setFormError("");
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setFormError("");
    if (!/^\+?[0-9\s().-]{6,}$/.test(phone.trim())) {
      setFormError("Please enter a valid phone number, with the country code if you have it.");
      return;
    }
    setSaving(true);
    const data = {
      name: name.trim(),
      type,
      phone: phone.trim(),
      region: serviceRegion,
      verifiedAt: serverTimestamp(),
      verifiedBy: user.uid,
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, "services", editingId), data);
      } else {
        await addDoc(collection(db, "services"), data);
      }
      setDrawerOpen(false);
      await fetchServices();
      setMessage("Saved and marked as verified today.");
    } catch (err) {
      console.error("Failed to save contact:", err);
      setFormError("Could not save. Please try again.");
    }
    setSaving(false);
  }

  async function handleDelete(s: Service) {
    if (!window.confirm("Delete " + s.name + "? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "services", s.id));
      setServices((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      console.error("Failed to delete contact:", err);
      setMessage("Could not delete. Please try again.");
    }
  }

  function exportCsv() {
    const esc = (v: string) => '"' + v.replace(/"/g, '""') + '"';
    const rows = [["name", "type", "region", "phone", "last_verified"]];
    services.forEach((s) => {
      const date = s.verifiedAt ? new Date(s.verifiedAt.seconds * 1000).toISOString().slice(0, 10) : "";
      rows.push([s.name, s.type, s.region, s.phone, date]);
    });
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gbvconnect-contacts.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const regionOptions = REGIONS.includes(serviceRegion) ? REGIONS : [serviceRegion, ...REGIONS];

  return (
    <StaffShell
      title="Verified contacts"
      subtitle="Only add a contact after you have called the number and confirmed it works."
      adminOnly
      actions={
        <>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-primary text-sm font-semibold shadow-sm hover:bg-surface-container transition-colors">
            <Download size={18} />
            Export CSV
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors shadow-sm">
            <Plus size={18} />
            Add contact
          </button>
        </>
      }
    >
      {message && <p className="text-sm text-available-text font-semibold">{message}</p>}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Total contacts</span>
          <p className="text-4xl font-semibold font-serif text-primary mt-2">{stats.total}</p>
        </div>
        <div className="rounded-xl bg-available-bg text-available-text p-5 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-bold opacity-80">Verified in {STALE_DAYS} days</span>
          <p className="text-4xl font-semibold font-serif mt-2">{stats.fresh}</p>
        </div>
        <div className="rounded-xl bg-notice-bg text-notice-text p-5 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-bold opacity-80">Need re-verification</span>
          <p className="text-4xl font-semibold font-serif mt-2">{stats.stale}</p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Regions covered</span>
          <p className="text-4xl font-semibold font-serif text-primary mt-2">{stats.regions}</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, region or number..."
              className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="relative md:w-64">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full h-[52px] pl-11 pr-4 appearance-none rounded-xl bg-surface-container-lowest text-on-surface font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
            >
              <option value="all">All regions</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["all", ...TYPES].map((t) => {
            const count = t === "all" ? services.length : services.filter((s) => s.type === t).length;
            return (
              <button
                key={t}
                onClick={() => setCategory(t)}
                className={
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold shadow-sm capitalize transition-all " +
                  (category === t
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface")
                }
              >
                {t === "all" ? "All" : t} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {fetching && <p className="text-on-surface-variant">Loading...</p>}
      {!fetching && filtered.length === 0 && (
        <p className="text-center text-on-surface-variant py-8">No contacts match.</p>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((s) => {
          const days = daysSince(s.verifiedAt);
          const stale = days === null || days > STALE_DAYS;
          return (
            <li key={s.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-surface-container text-sm text-on-surface-variant font-semibold capitalize">
                  {s.type}
                </span>
                {stale ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-notice-bg text-notice-text text-xs font-bold">
                    <TriangleAlert size={14} />
                    {days === null ? "Not verified in the app yet" : "Verified " + days + " days ago: re-verify"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-available-bg text-available-text text-xs font-bold">
                    <BadgeCheck size={14} />
                    {days === 0 ? "Verified today" : "Verified " + days + " days ago"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">{s.name}</h3>
                <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <MapPin size={14} />
                  {s.region}
                </p>
                <p className="text-sm text-on-surface flex items-center gap-1.5 mt-1 font-semibold">
                  <Phone size={14} className="text-tertiary" />
                  {s.phone}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a href={"tel:" + s.phone} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors">
                  <PhoneCall size={16} />
                  Test call
                </a>
                <button onClick={() => openEdit(s)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors">
                  <Pencil size={16} />
                  Edit
                </button>
                <button onClick={() => handleDelete(s)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80 transition-opacity">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#292524]/40" onClick={() => setDrawerOpen(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md h-full bg-surface-container-lowest shadow-[0_12px_32px_-4px_rgba(74,59,82,0.12)] p-6 overflow-y-auto flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-primary">{editingId ? "Edit contact" : "Add a contact"}</h2>
                <p className="text-sm text-on-surface-variant mt-1">Saving marks it as verified today.</p>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close" className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="svc-name" className="text-sm font-semibold text-on-surface">Organisation name</label>
              <input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="svc-type" className="text-sm font-semibold text-on-surface">Type of service</label>
              <select id="svc-type" value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="svc-phone" className="text-sm font-semibold text-on-surface">Phone (with country code)</label>
              <input id="svc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237..." className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="svc-region" className="text-sm font-semibold text-on-surface">Region</label>
              <select id="svc-region" value={serviceRegion} onChange={(e) => setServiceRegion(e.target.value)} className={inputClass}>
                {regionOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-notice-text bg-notice-bg rounded-xl p-3">
              For shelters, enter a phone number only. Never enter a street address here.
            </p>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-5 h-5 accent-[#4A3B52]" />
              <span className="text-sm text-on-surface">
                <strong>I have called this number and confirmed it works</strong> and reaches this organisation.
              </span>
            </label>

            {formError && <p className="text-sm text-error font-semibold">{formError}</p>}

            <div className="flex gap-2 mt-auto pt-2">
              <button
                type="submit"
                disabled={saving || !confirmed}
                className="flex-1 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Save changes" : "Add contact"}
              </button>
              <button type="button" onClick={() => setDrawerOpen(false)} className="px-5 h-[52px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </StaffShell>
  );
}
