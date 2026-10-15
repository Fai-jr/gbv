"use client";

import { Trash2, VolumeX } from "lucide-react";
import { when } from "./types";
import type { Report } from "./types";

export type ReportAction = "dismiss" | "remove" | "remove-mute";

export default function ReportsPanel({
  reports,
  onAct,
}: {
  reports: Report[];
  onAct: (r: Report, action: ReportAction) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      {reports.length === 0 && <p className="text-on-surface-variant">No reports.</p>}
      {reports.map((r) => (
        <article key={r.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-notice-bg text-notice-text text-xs font-semibold capitalize">{r.kind} reported</span>
            <span className="text-xs text-on-surface-variant">{when(r.createdAt)}</span>
          </div>
          <p className="text-on-surface bg-surface-container-low rounded-xl p-3">{r.preview || "(no preview)"}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onAct(r, "dismiss")} className="px-4 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high">
              Dismiss report
            </button>
            <button onClick={() => onAct(r, "remove")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80">
              <Trash2 size={16} />
              Remove {r.kind}
            </button>
            {r.authorUid && (
              <button onClick={() => onAct(r, "remove-mute")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-full-bg text-full-text text-sm font-semibold hover:opacity-80">
                <VolumeX size={16} />
                Remove and mute author
              </button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
