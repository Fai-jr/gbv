"use client";

import { useRef, useState } from "react";
import { ShieldAlert, ImagePlus, X } from "lucide-react";

export type ListingValues = {
  itemName: string;
  price: string;
  description: string;
  contactPhone: string;
  category: string;
  imageUrl: string;
};

export const EMPTY_LISTING: ListingValues = {
  itemName: "",
  price: "",
  description: "",
  contactPhone: "",
  category: "weaving",
  imageUrl: "",
};

const CATEGORIES = [
  { key: "weaving", label: "Weaving & raffia" },
  { key: "soap", label: "Natural soap & care" },
  { key: "textiles", label: "Textiles & indigo batik" },
  { key: "pottery", label: "Pottery & ceramics" },
  { key: "gifts", label: "Gift baskets" },
];

const inputClass =
  "w-full h-[52px] rounded-xl border border-border-soft bg-card px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container";

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 20 * 1024 * 1024) throw new Error("That file is too large. Please choose a smaller photo.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Could not read this image. Please use a JPG or PNG photo.");
  }
  const attempts = [
    { side: 800, quality: 0.72 },
    { side: 640, quality: 0.62 },
    { side: 480, quality: 0.55 },
  ];
  for (const a of attempts) {
    const scale = Math.min(1, a.side / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process this image.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", a.quality);
    if (dataUrl.length < 450000) {
      bitmap.close();
      return dataUrl;
    }
  }
  bitmap.close();
  throw new Error("This photo is too detailed to store. Please try a smaller one.");
}

export default function ListingForm({
  initial,
  submitLabel,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  initial: ListingValues;
  submitLabel: string;
  saving: boolean;
  error: string;
  onSubmit: (values: ListingValues) => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [v, setV] = useState<ListingValues>(initial);
  const [photoError, setPhotoError] = useState("");
  const [processing, setProcessing] = useState(false);

  function set<K extends keyof ListingValues>(key: K, value: ListingValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    setProcessing(true);
    try {
      set("imageUrl", await compressImage(file));
    } catch (err: any) {
      setPhotoError(err?.message || "Could not use that photo.");
    }
    setProcessing(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function cancel() {
    const dirty = JSON.stringify(v) !== JSON.stringify(initial);
    if (dirty && !window.confirm("Discard your changes? Nothing will be saved.")) return;
    onCancel();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(v);
  }

  return (
    <form onSubmit={submit} className="max-w-2xl bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-notice-bg text-notice-text text-xs">
        <ShieldAlert size={16} className="shrink-0 mt-0.5" />
        <span>
          Do not include the maker&apos;s name or any location in the title or description, and do not
          photograph faces or recognisable places.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="itemName" className="text-sm font-semibold text-on-surface">Item name</label>
        <input id="itemName" value={v.itemName} onChange={(e) => set("itemName", e.target.value)} className={inputClass} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="price" className="text-sm font-semibold text-on-surface">Price</label>
        <input id="price" value={v.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 12500 FCFA" className={inputClass} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-semibold text-on-surface">Short description</label>
        <textarea
          id="description"
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border-soft bg-card px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary-container"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contactPhone" className="text-sm font-semibold text-on-surface">Contact phone (organisation number)</label>
        <input id="contactPhone" value={v.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} className={inputClass} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-semibold text-on-surface">Category</label>
        <select id="category" value={v.category} onChange={(e) => set("category", e.target.value)} className={inputClass}>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-on-surface">Photo (optional)</span>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {v.imageUrl ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative">
              <img src={v.imageUrl} alt="Selected item" className="h-48 w-auto max-w-full rounded-xl object-cover shadow-sm" />
              <button
                type="button"
                onClick={() => set("imageUrl", "")}
                aria-label="Remove photo"
                className="absolute top-2 right-2 w-9 h-9 rounded-full bg-surface-container-lowest/95 text-on-surface flex items-center justify-center shadow-sm hover:bg-surface-container"
              >
                <X size={18} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={processing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-60"
            >
              <ImagePlus size={18} />
              {processing ? "Preparing photo..." : "Choose a different photo"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={processing}
            className="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed border-border-soft bg-surface-container-low text-primary font-semibold hover:bg-surface-container transition-colors disabled:opacity-60"
          >
            <ImagePlus size={28} />
            {processing ? "Preparing photo..." : "Choose a photo from this device"}
          </button>
        )}
        {photoError && <p className="text-sm text-error font-semibold">{photoError}</p>}
        <p className="text-xs text-on-surface-variant">
          The photo is resized on your device before saving. Hidden details such as the location a phone
          adds to a photo are removed.
        </p>
      </div>

      {error && <p className="text-sm text-error font-semibold">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || processing}
          className="flex-1 h-[52px] rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="px-6 h-[52px] rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
