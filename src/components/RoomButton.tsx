"use client";

import { useLang } from "@/lib/i18n";

export type RoomItem = {
  id: string;
  name: string;
  description: string;
  official: boolean;
  by?: string;
  creatorUid?: string;
};

export default function RoomButton({
  item,
  open,
  active,
  onSelect,
}: {
  item: RoomItem;
  open: boolean;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const { t } = useLang();
  const name = item.official ? t(item.name) : item.name;
  const description = item.official ? t(item.description) : item.description;

  return (
    <button
      onClick={() => onSelect(item.id)}
      className={
        "text-left rounded-xl p-5 shadow-sm transition-all flex flex-col gap-2 " +
        (active ? "bg-primary-container text-on-primary" : "bg-surface-container-lowest hover:shadow-md")
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{name}</span>
        <span
          className={
            "px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 " +
            (open ? "bg-available-bg text-available-text" : "bg-surface-container-high text-on-surface-variant")
          }
        >
          {open ? t("Open now") : t("Closed")}
        </span>
      </div>
      <span className={"text-sm " + (active ? "text-on-primary-container" : "text-on-surface-variant")}>{description}</span>
      {item.by && (
        <span className={"text-xs " + (active ? "text-on-primary-container" : "text-tertiary")}>
          {t("Started by {name}", { name: item.by })}
        </span>
      )}
    </button>
  );
}
