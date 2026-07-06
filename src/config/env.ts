/**
 * All environment access goes through this module.
 * AXN_API_URL is consumed server-side only (next.config.ts proxy target);
 * the browser always talks to the same-origin /api/axn prefix.
 */
export const env = {
  /** Same-origin prefix rewritten to the AXN backend by next.config.ts. */
  apiBasePath: "/api/axn",
  /** WebSocket path proxied to the AXN backend realtime gateway. */
  wsPath: "/api/axn/ws",
} as const;
