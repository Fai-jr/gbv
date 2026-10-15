"use client";

import { Check, X } from "lucide-react";
import { TOPIC_LABEL } from "@/lib/community";
import { when } from "./types";
import type { PendingStory } from "./types";

export default function StoriesPanel({
  stories,
  onReview,
}: {
  stories: PendingStory[];
  onReview: (s: PendingStory, status: "published" | "rejected") => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      {stories.length === 0 && <p className="text-on-surface-variant">No stories are waiting for review.</p>}
      {stories.map((s) => (
        <article key={s.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-container text-sm text-on-surface-variant font-semibold">
              {TOPIC_LABEL[s.topic] || "Story"}
            </span>
            <span className="text-xs text-on-surface-variant">{when(s.createdAt)}</span>
          </div>
          <h2 className="text-xl font-semibold text-primary">{s.title}</h2>
          <p className="text-sm text-on-surface-variant">By {s.pseudonym}</p>
          <p className="text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low rounded-xl p-4">{s.body}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onReview(s, "published")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-colors">
              <Check size={18} />
              Publish
            </button>
            <button onClick={() => onReview(s, "rejected")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high transition-colors">
              <X size={18} />
              Do not publish
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
