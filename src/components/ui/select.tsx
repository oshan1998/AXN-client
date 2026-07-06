import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className={cn("relative", className)}>
    <select
      ref={ref}
      className={cn(
        "h-9 w-full appearance-none rounded-lg border border-line-strong bg-surface",
        "pl-3 pr-8 text-sm text-ink transition-colors",
        "focus:border-accent focus:outline-2 focus:outline-accent/20 disabled:opacity-50",
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
  </div>
));
Select.displayName = "Select";
