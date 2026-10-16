"use client";

import { Eye, Trash2, VolumeX } from "lucide-react";
import { ROOMS } from "@/lib/community";
import { when } from "./types";
import type { Group, Msg } from "./types";
import RevealIdentity from "./RevealIdentity";

export default function RoomsPanel({
  settings,
  groups,
  liveRoom,
  live,
  onToggle,
  onWatch,
  onDeleteGroup,
  onDeleteMessage,
  onMute,
}: {
  settings: Record<string, boolean>;
  groups: Group[];
  liveRoom: string | null;
  live: Msg[];
  onToggle: (roomId: string, open: boolean) => void;
  onWatch: (roomId: string | null) => void;
  onDeleteGroup: (g: Group) => void;
  onDeleteMessage: (roomId: string, id: string) => void;
  onMute: (uid: string) => void;
}) {
  const cards = [
    ...ROOMS.map((r) => ({ id: r.id, name: r.name, group: null as Group | null })),
    ...groups.map((g) => ({ id: g.id, name: g.name, group: g as Group | null })),
  ];
  const liveName = cards.find((c) => c.id === liveRoom)?.name || "Room";

  return (
    <section className="flex flex-col gap-4">
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((r) => {
          const open = settings[r.id] === true;
          return (
            <li key={r.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-semibold text-primary block truncate">{r.name}</span>
                  <span className="text-xs text-on-surface-variant">
                    {r.group ? "Member group, started by " + r.group.creatorPseudonym : "Official room"}
                  </span>
                </div>
                <span className={"px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 " + (open ? "bg-available-bg text-available-text" : "bg-surface-container-high text-on-surface-variant")}>
                  {open ? "Open" : "Closed"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onToggle(r.id, !open)} className={"px-4 py-2.5 rounded-xl font-semibold transition-colors " + (open ? "bg-full-bg text-full-text hover:opacity-80" : "bg-primary-container text-on-primary hover:bg-primary")}>
                  {open ? "Close" : "Open"}
                </button>
                <button onClick={() => onWatch(r.id)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
                  <Eye size={18} />
                  Watch live
                </button>
                {r.group && (
                  <button onClick={() => onDeleteGroup(r.group as Group)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-full-bg text-full-text font-semibold hover:opacity-80 transition-opacity">
                    <Trash2 size={18} />
                    Delete group
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {liveRoom && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-primary">Live: {liveName}</h2>
            <button onClick={() => onWatch(null)} className="text-sm font-semibold text-primary hover:underline">Stop watching</button>
          </div>
          {live.length === 0 && <p className="text-sm text-on-surface-variant">No messages yet.</p>}
          <ul className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
            {live.map((m) => (
              <li key={m.id} className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-xs text-on-surface-variant">
                  <span className="font-semibold">{m.pseudonym}</span>
                  <span>{when(m.createdAt)}</span>
                </div>
                <p className="text-on-surface">{m.text}</p>
                <RevealIdentity uid={m.authorUid} context="room message" />
                <div className="flex gap-2">
                  <button onClick={() => onDeleteMessage(liveRoom, m.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-full-bg text-full-text text-xs font-semibold hover:opacity-80">
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <button onClick={() => onMute(m.authorUid)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high">
                    <VolumeX size={14} />
                    Mute author
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
