import { Info } from "lucide-react";

export function NotWiredBanner({ registry }: { registry: string }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3">
      <Info className="mt-0.5 size-4 shrink-0 text-warning" />
      <p className="text-[13px] leading-relaxed text-warning">
        The backend loads {registry} from <code className="font-mono text-xs">mcp.config.json</code>{" "}
        and the skills directory at startup, but doesn&apos;t expose a management API yet. This
        screen shows the design — additions here aren&apos;t persisted.
      </p>
    </div>
  );
}
