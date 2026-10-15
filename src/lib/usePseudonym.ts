"use client";

import { useState, useSyncExternalStore } from "react";
import { getPseudonym, resetPseudonym } from "@/lib/community";

const noSubscribe = () => () => {};

export function usePseudonym(): [string, () => void] {
  const stored = useSyncExternalStore(noSubscribe, getPseudonym, () => "");
  const [override, setOverride] = useState<string | null>(null);
  return [override ?? stored, () => setOverride(resetPseudonym())];
}
