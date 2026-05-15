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
 * POST /v4/leagues/{leagueId}/lineup/fill
 *
 * Submits a new lineup for the authenticated user in the given league.
 * Marco's leagues run Arena-style rules (full-pool draft per matchday),
 * which use the /fill endpoint with a different body shape than the
 * classical "set lineup" path:
 *   { "lud": "4-4-2", "pls": ["1235", ...] }
 *
 * Players are passed in canonical slot order (GK, defenders, midfielders,
 * forwards) — Kickbase derives positions from the formation type.
 */
export const setLineupController = {
  schema: { params: leagueParamsSchema, body: setLineupBodySchema },
  handler: async (request, reply) => {
    try {
      const { leagueId } = request.params;
      const raw = await kickbaseRequest({
        method: "POST",
        path: `/v4/leagues/${encodeURIComponent(leagueId)}/lineup/fill`,
        token: request.kickbaseToken,
        body: { lud: request.body.type, pls: request.body.players },
        log: request.log
      });
      return setGeneralResponse(reply, 200, "Success", "Lineup updated", raw ?? {});
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
