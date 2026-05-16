import { handleErrorResponse, setGeneralResponse } from "../helpers/responseHandler.helpers.js";
import { leagueParamsSchema } from "../schemas/leagues.schemas.js";
import { kickbaseRequest } from "../services/kickbaseClient.services.js";
import {
  normalizeLeaguesSelectionResponse,
  normalizeRankingResponse
} from "../services/normalizer.services.js";

export const getMyLeaguesController = {
  handler: async (request, reply) => {
    try {
      const raw = await kickbaseRequest({
        method: "GET",
        path: "/v4/leagues/selection",
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(
        reply,
        200,
        "Success",
        "Leagues retrieved",
        normalizeLeaguesSelectionResponse(raw)
      );
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

export const getLeagueRankingController = {
  schema: { params: leagueParamsSchema },
  handler: async (request, reply) => {
    try {
      const { leagueId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/leagues/${encodeURIComponent(leagueId)}/ranking`,
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(
        reply,
        200,
        "Success",
        "League ranking retrieved",
        normalizeRankingResponse({ ...raw, id: leagueId })
      );
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

const setLineupBodySchema = {
  type: "object",
  required: ["type", "players"],
  properties: {
    type: { type: "string", minLength: 3 },
    players: {
      type: "array",
      minItems: 11,
      maxItems: 11,
      items: { type: "string", minLength: 1 }
    }
  }
};

/**
 * POST /v4/leagues/{leagueId}/lineup
 *
 * Submits a new lineup for the authenticated user in the given league.
 * Sets BOTH the formation and the player slots. Body shape:
 *   { "type": "4-3-3", "players": ["1235", ...] }
 *
 * Players are passed in canonical slot order (GK, defenders, midfielders,
 * forwards) — Kickbase derives positions from the formation type.
 *
 * NOTE: There's also a sibling /lineup/fill endpoint that only updates
 * player slots while keeping the current formation. We don't use it
 * because Marco wants to change formation per matchday (4-5-1, 4-3-3, …)
 * based on the recommendation. Empirically /lineup/fill silently drops
 * any players that don't fit the current formation's slot counts.
 */
export const setLineupController = {
  schema: { params: leagueParamsSchema, body: setLineupBodySchema },
  handler: async (request, reply) => {
    try {
      const { leagueId } = request.params;
      // 1) Clear the existing lineup first. Empirically /fill (and
      // possibly /lineup) keeps stale slots from the previous formation
      // when you switch e.g. 4-5-1 → 4-3-3. Wiping first guarantees the
      // new formation is set cleanly.
      let cleared = null;
      try {
        cleared = await kickbaseRequest({
          method: "POST",
          path: `/v4/leagues/${encodeURIComponent(leagueId)}/lineup/clear`,
          token: request.kickbaseToken,
          log: request.log
        });
      } catch (clearErr) {
        // Don't fail the whole submit if clear fails — Kickbase will
        // sometimes 4xx if the lineup is already empty. Log + continue.
        request.log?.warn(
          { err: clearErr.message },
          "Lineup clear failed, continuing to submit anyway"
        );
      }

      // 2) Set the new lineup. We've observed that {type, players} and
      // {lud, pls} both return a 200 but Kickbase silently keeps the old
      // lineup. Try variants in order and log each so we can see which
      // one actually persists. We also try sending playerIds as numbers
      // because Kickbase's own responses use numeric ids (response: pls:
      // [1581, ...]).
      //
      // The first variant that returns a body whose `lt` matches our
      // requested formation wins — that's our signal that the submit
      // actually changed the lineup.
      const requestedType = request.body.type;
      const playerStrings = request.body.players.map(String);
      const playerNumbers = playerStrings.map((id) => Number(id));

      const attempts = [
        { path: "/lineup", body: { lt: requestedType, pls: playerStrings } },
        { path: "/lineup", body: { lt: requestedType, pls: playerNumbers } },
        { path: "/lineup", body: { type: requestedType, players: playerStrings } },
        { path: "/lineup/fill", body: { lt: requestedType, pls: playerStrings } },
        { path: "/lineup/fill", body: { lud: requestedType, pls: playerStrings } }
      ];

      let raw = null;
      let chosenAttempt = null;
      for (const attempt of attempts) {
        try {
          const resp = await kickbaseRequest({
            method: "POST",
            path: `/v4/leagues/${encodeURIComponent(leagueId)}${attempt.path}`,
            token: request.kickbaseToken,
            body: attempt.body,
            log: request.log
          });
          const lt = resp?.lt ?? resp?.type;
          request.log?.info(
            { path: attempt.path, bodyShape: Object.keys(attempt.body), respLt: lt },
            "Lineup submit attempt"
          );
          // Success criteria: response formation matches what we asked for.
          if (lt === requestedType) {
            raw = resp;
            chosenAttempt = attempt;
            break;
          }
          if (!raw) {
            raw = resp;
            chosenAttempt = attempt;
          }
        } catch (err) {
          request.log?.warn(
            { path: attempt.path, err: err.message },
            "Lineup submit attempt failed"
          );
        }
      }

      return setGeneralResponse(reply, 200, "Success", "Lineup updated", {
        cleared,
        lineup: raw ?? {},
        chosenAttempt: chosenAttempt
          ? { path: chosenAttempt.path, bodyKeys: Object.keys(chosenAttempt.body) }
          : null
      });
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

/**
 * GET /v4/leagues/{leagueId}/lineup — fetch the user's currently saved
 * lineup. Useful to verify that a POST actually persisted.
 */
export const getCurrentLineupController = {
  schema: { params: leagueParamsSchema },
  handler: async (request, reply) => {
    try {
      const { leagueId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/leagues/${encodeURIComponent(leagueId)}/lineup`,
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(reply, 200, "Success", "Current lineup", raw ?? {});
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

export const getLeagueMeController = {
  schema: { params: leagueParamsSchema },
  handler: async (request, reply) => {
    try {
      const { leagueId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/leagues/${encodeURIComponent(leagueId)}/me`,
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(reply, 200, "Success", "League/me retrieved", raw);
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};
