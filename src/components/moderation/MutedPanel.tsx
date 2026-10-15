"use client";

import { Volume2 } from "lucide-react";
import { when } from "./types";
import type { Muted } from "./types";

export default function MutedPanel({ muted, onUnmute }: { muted: Muted[]; onUnmute: (uid: string) => void }) {
  return (
    <section className="flex flex-col gap-3">
      {muted.length === 0 && <p className="text-on-surface-variant">Nobody is muted.</p>}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {muted.map((m) => (
          <li key={m.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-primary">Device {m.id.slice(0, 6)}</p>
              <p className="text-xs text-on-surface-variant">{when(m.mutedAt)}</p>
            </div>
            <button onClick={() => onUnmute(m.id)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high">
              <Volume2 size={16} />
              Unmute
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
