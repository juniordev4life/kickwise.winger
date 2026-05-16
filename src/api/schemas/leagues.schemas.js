export const leagueParamsSchema = {
  type: "object",
  required: ["leagueId"],
  properties: {
    leagueId: { type: "string", minLength: 1, maxLength: 64 }
  }
};

/**
 * Optional query for league-ranking endpoints. `day` selects a specific
 * matchday's snapshot (forwarded to Kickbase as `?day=N`). When omitted,
 * Kickbase returns the current matchday's ranking. Range 1..34 covers a
 * full Bundesliga season.
 *
 * Hypothesis: Kickbase's player-history endpoint exposes matchday on
 * `entry.day`, so the same `day` query name is the most likely match for
 * the ranking endpoint. If Kickbase ignores it, the caller receives the
 * current snapshot — caller-side dedup detects this.
 */
export const leagueRankingQuerySchema = {
  type: "object",
  properties: {
    day: { type: "integer", minimum: 1, maximum: 34 }
  }
};
