"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export default function AdminFeedbackPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [counts, setCounts] = useState<{
    total: number;
    reachedYes: number;
    reachedNo: number;
    helpedYes: number;
    helpedNo: number;
  } | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "admin")) {
      router.replace("/staff/login");
    }
  }, [loading, profile, router]);

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;

    async function fetchCounts() {
      const feedbackRef = collection(db, "feedback");

      const [total, reachedYes, reachedNo, helpedYes, helpedNo] = await Promise.all([
        getCountFromServer(feedbackRef),
        getCountFromServer(query(feedbackRef, where("reachedService", "==", true))),
        getCountFromServer(query(feedbackRef, where("reachedService", "==", false))),
        getCountFromServer(query(feedbackRef, where("wasHelped", "==", true))),
        getCountFromServer(query(feedbackRef, where("wasHelped", "==", false))),
      ]);

      setCounts({
        total: total.data().count,
        reachedYes: reachedYes.data().count,
        reachedNo: reachedNo.data().count,
        helpedYes: helpedYes.data().count,
        helpedNo: helpedNo.data().count,
      });
      setFetching(false);
    }

    fetchCounts();
  }, [loading, profile]);

  if (loading || !profile) return <p className="p-8">Loading...</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-1 text-lg font-medium text-zinc-900">Feedback Statistics</h1>
      <p className="mb-6 text-sm text-zinc-600">
        Totals only. Individual responses are not identifiable and cannot be
        viewed here.
      </p>

      {fetching && <p className="text-sm text-zinc-500">Loading...</p>}

      {!fetching && counts && (
        <div className="space-y-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">Total responses</p>
            <p className="text-2xl font-semibold text-zinc-900">{counts.total}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium text-zinc-900">Reached the contact?</p>
            <p className="text-sm text-zinc-700">Yes: {counts.reachedYes}</p>
            <p className="text-sm text-zinc-700">No: {counts.reachedNo}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium text-zinc-900">Was helped?</p>
            <p className="text-sm text-zinc-700">Yes: {counts.helpedYes}</p>
            <p className="text-sm text-zinc-700">No: {counts.helpedNo}</p>
          </div>
        </div>
      )}
    </div>
  );
}
