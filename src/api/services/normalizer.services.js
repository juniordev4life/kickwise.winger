/**
 * Normalize Kickbase's login response into a stable Kickwise-internal shape.
 *
 * Kickbase uses abbreviated field names (`tkn`, `tknex`, `u.id`, `u.lgs` …).
 * Downstream services must never depend on those names — only on the shape
 * defined here.
 *
 * @param {object} raw raw JSON response from Kickbase's POST /v4/user/login
 * @returns {{ token: string, tokenExpiry: string|null, user: {
 *   id: string, name: string, avatarUrl: string|null,
 *   leagues: Array<{id: string, name: string}>
 * }}} normalized shape
 *
 * @example
 *   const normalized = normalizeLoginResponse(rawKickbaseJson);
 *   await db.set(`users/${normalized.user.id}`, normalized);
 */
export function normalizeLoginResponse(raw) {
  return {
    token: raw.tkn ?? raw.token ?? "",
    tokenExpiry: raw.tknex ?? raw.tokenExpiry ?? null,
    user: {
      id: raw.u?.id ?? raw.user?.id ?? raw.userId ?? "",
      name: raw.u?.name ?? raw.user?.name ?? "",
      avatarUrl: raw.u?.avt ?? raw.user?.avatarUrl ?? null,
      leagues: (raw.u?.lgs ?? raw.user?.leagues ?? []).map((l) => ({
        id: l.id ?? l.lgid ?? "",
        name: l.n ?? l.name ?? ""
      }))
    }
  };
}

/**
 * Normalize a Kickbase league ranking response.
 *
 * @param {object} raw raw Kickbase JSON
 * @returns {{ leagueId: string, entries: Array<{
 *   userId: string, name: string, totalPoints: number, rank: number,
 *   teamValue: number|null, lastWeekPoints: number|null
 * }>}}
 *
 * @example
 *   const r = normalizeRankingResponse(raw);
 */
export function normalizeRankingResponse(raw) {
  return {
    leagueId: raw.id ?? raw.lgid ?? "",
    entries: (raw.users ?? raw.rnk ?? []).map((entry) => ({
      userId: entry.uid ?? entry.id ?? "",
      name: entry.uname ?? entry.name ?? "",
      totalPoints: Number(entry.spr ?? entry.totalPoints ?? 0),
      rank: Number(entry.pl ?? entry.rank ?? 0),
      teamValue: entry.tv ?? entry.teamValue ?? null,
      lastWeekPoints: entry.lp ?? entry.lastWeekPoints ?? null
    }))
  };
}

/**
 * Normalize a Kickbase squad response (the user's current squad in a league).
 *
 * @param {object} raw raw Kickbase JSON
 * @returns {{ leagueId: string, players: Array<{
 *   playerId: string, name: string, position: string,
 *   marketValue: number, totalPoints: number, average: number,
 *   teamId: string, status: string
 * }>}}
 *
 * @example
 *   const s = normalizeSquadResponse(raw);
 */
export function normalizeSquadResponse(raw) {
  return {
    leagueId: raw.lgid ?? "",
    players: (raw.it ?? raw.players ?? []).map((p) => ({
      playerId: p.i ?? p.id ?? "",
      name: p.n ?? p.name ?? `${p.fn ?? ""} ${p.ln ?? ""}`.trim(),
      position: mapPosition(p.pos ?? p.position),
      marketValue: Number(p.mv ?? p.marketValue ?? 0),
      totalPoints: Number(p.tp ?? p.totalPoints ?? 0),
      average: Number(p.ap ?? p.averagePoints ?? 0),
      teamId: p.tid ?? p.teamId ?? "",
      status: mapStatus(p.st ?? p.status)
    }))
  };
}

function mapPosition(raw) {
  const code = String(raw ?? "").toUpperCase();
  if (["1", "GK", "TW", "TOR"].includes(code)) return "GK";
  if (["2", "DEF", "ABW"].includes(code)) return "DEF";
  if (["3", "MID", "MF", "MFD"].includes(code)) return "MID";
  if (["4", "FWD", "ST", "ANG"].includes(code)) return "FWD";
  return code || "UNKNOWN";
}

function mapStatus(raw) {
  const code = String(raw ?? "").toLowerCase();
  if (code === "0" || code === "fit") return "fit";
  if (code === "1" || code === "injured") return "injured";
  if (code === "2" || code === "out") return "out";
  if (code === "4" || code === "questionable") return "questionable";
  return code || "unknown";
}
