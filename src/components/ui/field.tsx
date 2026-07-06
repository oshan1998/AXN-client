import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Label + control + optional hint, the standard form row. */
export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-xs leading-relaxed text-ink-faint">{hint}</span> : null}
    </label>
  );
}
