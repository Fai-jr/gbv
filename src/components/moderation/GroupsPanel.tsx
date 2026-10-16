"use client";

import { Check, X } from "lucide-react";
import { TOPIC_LABEL } from "@/lib/community";
import { when } from "./types";
import type { Group } from "./types";
import RevealIdentity from "./RevealIdentity";

export default function GroupsPanel({
  groups,
  onReview,
}: {
  groups: Group[];
  onReview: (g: Group, status: "approved" | "rejected") => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      {groups.length === 0 && <p className="text-on-surface-variant">No groups are waiting for review.</p>}
      {groups.map((g) => (
        <article key={g.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-container text-sm text-on-surface-variant font-semibold">
              {TOPIC_LABEL[g.topic] || "Group"}
            </span>
            <span className="text-xs text-on-surface-variant">{when(g.createdAt)}</span>
          </div>
          <h2 className="text-xl font-semibold text-primary">{g.name}</h2>
          <p className="text-sm text-on-surface-variant">Proposed by {g.creatorPseudonym}</p>
          <RevealIdentity uid={g.creatorUid} context="group request" />
          <p className="text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low rounded-xl p-4">{g.description}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onReview(g, "approved")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
              <Check size={18} />
              Approve
            </button>
            <button onClick={() => onReview(g, "rejected")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
              <X size={18} />
              Do not approve
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
