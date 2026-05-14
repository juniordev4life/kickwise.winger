/**
 * Kickbase API configuration, loaded from environment variables.
 *
 * @returns {{ baseUrl: string, timeoutMs: number, maxRetries: number }}
 *   Resolved Kickbase config — call once during startup, then pass to consumers.
 *
 * @example
 *   const { baseUrl } = getKickbaseConfig();
 */
export function getKickbaseConfig() {
  return {
    baseUrl: process.env.KICKBASE_BASE_URL ?? "https://api.kickbase.com",
    timeoutMs: Number.parseInt(process.env.KICKBASE_REQUEST_TIMEOUT_MS ?? "10000", 10),
    maxRetries: Number.parseInt(process.env.KICKBASE_MAX_RETRIES ?? "3", 10)
  };
}
