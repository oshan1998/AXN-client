"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

/** Removable token, e.g. an agent's allowed tools/skills. */
export function Chip({ label, onRemove, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-accent-soft py-1 pl-2.5 text-xs font-medium text-accent-ink",
        onRemove ? "pr-1" : "pr-2.5",
        className,
      )}
    >
      {label}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="flex size-4 items-center justify-center rounded-full transition-colors hover:bg-accent-ink/10"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}
