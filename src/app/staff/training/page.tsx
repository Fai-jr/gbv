"use client";

import StaffShell from "@/components/StaffShell";
import { TRAINING_TOPICS } from "@/lib/trainingContent";
import { ChevronDown } from "lucide-react";

const KIND_LABEL: Record<string, string> = {
  video: "Video",
  pdf: "PDF",
  app: "App",
  web: "Web page",
  audio: "Audio",
};

export default function TrainingPage() {
  return (
    <StaffShell title="Staff training" subtitle="Starter material summarised from published sources.">

      <div className="flex flex-col gap-4 max-w-3xl">
        {TRAINING_TOPICS.map((topic) => (
          <details key={topic.id} className="group bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <summary className="cursor-pointer list-none p-5 flex items-start justify-between gap-4 hover:bg-surface transition-colors">
              <div>
                <p className="text-lg font-semibold text-primary">{topic.title}</p>
                <p className="text-sm text-on-surface-variant mt-1">{topic.summary}</p>
              </div>
              <ChevronDown size={22} className="text-primary shrink-0 transition-transform group-open:rotate-180" />
            </summary>

            <div className="px-5 pb-5 flex flex-col gap-4">
              {topic.sections.map((section) => (
                <div key={section.heading}>
                  <p className="font-semibold text-on-surface">{section.heading}</p>
                  <ul className="mt-1.5 list-disc pl-5 flex flex-col gap-1.5 text-sm text-on-surface-variant">
                    {section.points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <p className="font-semibold text-on-surface">Learn more</p>
                <ul className="mt-1.5 flex flex-col gap-2 text-sm">
                  {topic.resources.map((r) => (
                    <li key={r.url} className="flex items-start gap-2">
                      <span className="shrink-0 px-2 py-0.5 rounded bg-surface-container text-xs text-on-surface-variant">
                        {KIND_LABEL[r.kind]}
                      </span>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-tertiary">
                        {r.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-on-surface-variant">Based on: {topic.basedOn}</p>
            </div>
          </details>
        ))}
      </div>
    </StaffShell>
  );
}
