"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { TRAINING_TOPICS } from "@/lib/trainingContent";

const STAFF_ROLES = ["ngo_staff", "shelter_staff", "admin"];

const KIND_LABEL: Record<string, string> = {
  video: "Video",
  pdf: "PDF",
  app: "App",
  web: "Web page",
  audio: "Audio",
};

export default function TrainingPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!profile || !STAFF_ROLES.includes(profile.role))) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  if (loading || !profile) return <p className="p-8">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-xl font-semibold text-ink">Staff Training</h1>
      <p className="mb-6 text-sm text-muted">
        Starter material summarised from published sources. Before relying on it,
        have a local GBV specialist check that it fits Cameroonian law and practice.
      </p>

      <div className="space-y-3">
        {TRAINING_TOPICS.map((topic) => (
          <details key={topic.id} className="rounded-lg border border-border-soft bg-card p-4 shadow-sm">
            <summary className="cursor-pointer font-medium text-ink">{topic.title}</summary>

            <p className="mt-3 text-sm text-muted">{topic.summary}</p>

            {topic.sections.map((section) => (
              <div key={section.heading} className="mt-4">
                <p className="text-sm font-medium text-ink">{section.heading}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink">
                  {section.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="mt-4">
              <p className="text-sm font-medium text-ink">Learn more</p>
              <ul className="mt-1 space-y-1 text-sm">
                {topic.resources.map((r) => (
                  <li key={r.url}>
                    <span className="mr-2 rounded bg-tint px-2 py-0.5 text-xs text-muted">
                      {KIND_LABEL[r.kind]}
                    </span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-plum underline">
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-xs text-muted">Based on: {topic.basedOn}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
