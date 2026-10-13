"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import StaffShell from "@/components/StaffShell";
import { Lock } from "lucide-react";

type Counts = {
  total: number;
  reachedYes: number;
  reachedNo: number;
  helpedYes: number;
  helpedNo: number;
};

function pct(yes: number, no: number) {
  const answered = yes + no;
  return answered > 0 ? Math.round((yes / answered) * 100) : null;
}

function Measure({ title, question, yes, no }: { title: string; question: string; yes: number; no: number }) {
  const p = pct(yes, no);
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">{question}</p>
      </div>
      {p === null ? (
        <p className="text-sm text-on-surface-variant">No answers yet.</p>
      ) : (
        <>
          <div className="flex items-end justify-between">
            <span className="text-5xl font-semibold font-serif text-primary">{p}%</span>
            <span className="text-sm text-on-surface-variant">said yes</span>
          </div>
          <div className="h-3 rounded-full bg-full-bg overflow-hidden">
            <div className="h-full rounded-full bg-available-text" style={{ width: p + "%" }} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-available-text font-semibold">Yes: {yes}</span>
            <span className="text-full-text font-semibold">No: {no}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const { profile, loading } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;
    async function fetchCounts() {
      try {
        const ref = collection(db, "feedback");
        const [total, reachedYes, reachedNo, helpedYes, helpedNo] = await Promise.all([
          getCountFromServer(ref),
          getCountFromServer(query(ref, where("reachedService", "==", true))),
          getCountFromServer(query(ref, where("reachedService", "==", false))),
          getCountFromServer(query(ref, where("wasHelped", "==", true))),
          getCountFromServer(query(ref, where("wasHelped", "==", false))),
        ]);
        setCounts({
          total: total.data().count,
          reachedYes: reachedYes.data().count,
          reachedNo: reachedNo.data().count,
          helpedYes: helpedYes.data().count,
          helpedNo: helpedNo.data().count,
        });
      } catch (err) {
        console.error("Failed to load feedback totals:", err);
        setError("Could not load the totals. Please refresh.");
      }
      setFetching(false);
    }
    fetchCounts();
  }, [loading, profile]);

  return (
    <StaffShell
      title="Feedback statistics"
      subtitle="Anonymous answers from people who used a contact. Totals only."
      adminOnly
    >
      {error && <p className="text-sm text-error font-semibold">{error}</p>}
      {fetching && <p className="text-on-surface-variant">Loading...</p>}

      {!fetching && counts && (
        <>
          <div className="rounded-xl bg-surface-container-lowest shadow-sm p-6 flex items-center justify-between max-w-md">
            <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Total responses</span>
            <span className="text-5xl font-semibold font-serif text-primary">{counts.total}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Measure title="Reached the contact" question="Did you manage to reach the contact?" yes={counts.reachedYes} no={counts.reachedNo} />
            <Measure title="Was helped" question="Were you helped?" yes={counts.helpedYes} no={counts.helpedNo} />
          </div>
        </>
      )}

      <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container text-on-surface-variant max-w-2xl">
        <Lock size={20} className="text-tertiary shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          Responses are anonymous. They carry no name, account or location, and individual answers cannot be
          viewed here, only these totals.
        </p>
      </div>
    </StaffShell>
  );
}
