"use client";

import { wipeLocalData } from "@/lib/privacy";

export default function ClearDataButton() {
  async function clear() {
    const ok = window.confirm(
      "Remove everything this site has saved on this device? This includes your list of stories, your chat name and the offline copy of the directory. Your browser history is separate and is not changed. Use a private window to keep it clean."
    );
    if (!ok) return;
    await wipeLocalData("/");
  }

  return (
    <button type="button" onClick={clear} className="hover:text-on-surface transition-colors">
      Clear data from this device
    </button>
  );
}
