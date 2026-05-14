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
    leagueName: raw.ti ?? raw.name ?? null,
    entries: (raw.us ?? raw.users ?? raw.rnk ?? []).map((entry) => ({
      userId: entry.i ?? entry.uid ?? entry.id ?? "",
      name: entry.n ?? entry.uname ?? entry.name ?? "",
      totalPoints: Number(entry.sp ?? entry.spr ?? entry.totalPoints ?? 0),
      rank: Number(entry.spl ?? entry.pl ?? entry.rank ?? 0),
      teamValue: entry.tv ?? entry.teamValue ?? null,
      matchdayPoints: entry.mdp ?? null,
      seasonHighPoints: entry.shp ?? null,
      isAdmin: Boolean(entry.adm ?? false)
    }))
  };
}

/**
 * Normalize Kickbase's GET /v4/leagues/selection response into Kickwise's
 * league-list shape. Kickbase returns `{ it: [...] }` with abbreviated keys.
 *
 * @param {object} raw raw Kickbase response
 * @returns {{ leagues: Array<{
 *   id: string, name: string, rank: number|null, teamValue: number|null,
 *   budget: number|null, playerCount: number|null, unreadCount: number|null,
 *   isAdmin: boolean, imageUrl: string|null
 * }>}}
 *
 * @example
 *   const out = normalizeLeaguesSelectionResponse(raw);
 *   //  out.leagues[0] = { id: "7081897", name: "RB Leibzig", rank: 8, ... }
 */
export function normalizeLeaguesSelectionResponse(raw) {
  return {
    leagues: (raw.it ?? raw.leagues ?? []).map((l) => ({
      id: l.i ?? l.id ?? "",
      name: l.n ?? l.name ?? "",
      rank: l.pl ?? l.rank ?? null,
      teamValue: l.tv ?? l.teamValue ?? null,
      budget: l.b ?? l.budget ?? null,
      playerCount: l.lpc ?? l.playerCount ?? null,
      unreadCount: l.un ?? l.unreadCount ?? null,
      isAdmin: Boolean(l.adm ?? l.isAdmin ?? false),
      imageUrl: l.lim ?? l.imageUrl ?? null
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
