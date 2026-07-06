import type { ChatRunResult } from "@/types/chat";

export function extractReply(result: ChatRunResult): string {
  const output = result.output;
  if (typeof output === "string") return output;
  if (output && typeof output === "object") {
    const values = Object.values(output as Record<string, unknown>);
    const last = values[values.length - 1];
    if (typeof last === "string") return last;
    return JSON.stringify(output, null, 2);
  }
  return String(output ?? "");
}
