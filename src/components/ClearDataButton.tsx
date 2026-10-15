"use client";

import { wipeLocalData } from "@/lib/privacy";
import { useLang } from "@/lib/i18n";

export default function ClearDataButton() {
  const { t } = useLang();

  async function clear() {
    const ok = window.confirm(
      t(
        "Remove everything this site has saved on this device? This includes your list of stories, your chat name and the offline copy of the directory. Your browser history is separate and is not changed. Use a private window to keep it clean."
      )
    );
    if (!ok) return;
    await wipeLocalData("/");
  }

  return (
    <button type="button" onClick={clear} className="hover:text-on-surface transition-colors">
      {t("Clear data from this device")}
    </button>
  );
}
