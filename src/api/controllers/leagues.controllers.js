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
      const raw = await kickbaseRequest({
        method: "POST",
        path: `/v4/leagues/${encodeURIComponent(leagueId)}/lineup`,
        token: request.kickbaseToken,
        body: { type: request.body.type, players: request.body.players },
        log: request.log
      });
      return setGeneralResponse(reply, 200, "Success", "Lineup updated", raw ?? {});
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
