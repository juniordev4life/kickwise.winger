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
