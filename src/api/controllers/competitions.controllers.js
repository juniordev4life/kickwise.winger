import { handleErrorResponse, setGeneralResponse } from "../helpers/responseHandler.helpers.js";
import { kickbaseRequest } from "../services/kickbaseClient.services.js";
import {
  normalizeCompetitionTableResponse,
  normalizePlayerDetailResponse,
  normalizePlayerPerformanceResponse,
  normalizeTeamProfileResponse
} from "../services/normalizer.services.js";

const competitionParamsSchema = {
  type: "object",
  required: ["competitionId"],
  properties: {
    competitionId: { type: "string", pattern: "^[0-9]+$" }
  }
};

const teamParamsSchema = {
  type: "object",
  required: ["competitionId", "teamId"],
  properties: {
    competitionId: { type: "string", pattern: "^[0-9]+$" },
    teamId: { type: "string", pattern: "^[0-9]+$" }
  }
};

const playerParamsSchema = {
  type: "object",
  required: ["competitionId", "playerId"],
  properties: {
    competitionId: { type: "string", pattern: "^[0-9]+$" },
    playerId: { type: "string", pattern: "^[0-9]+$" }
  }
};

export const getCompetitionTableController = {
  schema: { params: competitionParamsSchema },
  handler: async (request, reply) => {
    try {
      const { competitionId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/competitions/${encodeURIComponent(competitionId)}/table`,
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(
        reply,
        200,
        "Success",
        "Competition table retrieved",
        normalizeCompetitionTableResponse(raw)
      );
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

export const getTeamProfileController = {
  schema: { params: teamParamsSchema },
  handler: async (request, reply) => {
    try {
      const { competitionId, teamId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/competitions/${encodeURIComponent(competitionId)}/teams/${encodeURIComponent(teamId)}/teamprofile`,
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(
        reply,
        200,
        "Success",
        "Team profile retrieved",
        normalizeTeamProfileResponse(raw)
      );
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

export const getPlayerDetailController = {
  schema: { params: playerParamsSchema },
  handler: async (request, reply) => {
    try {
      const { competitionId, playerId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/competitions/${encodeURIComponent(competitionId)}/players/${encodeURIComponent(playerId)}`,
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(
        reply,
        200,
        "Success",
        "Player detail retrieved",
        normalizePlayerDetailResponse(raw)
      );
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

export const getPlayerPerformanceController = {
  schema: { params: playerParamsSchema },
  handler: async (request, reply) => {
    try {
      const { competitionId, playerId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/competitions/${encodeURIComponent(competitionId)}/players/${encodeURIComponent(playerId)}/performance`,
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(
        reply,
        200,
        "Success",
        "Player performance retrieved",
        normalizePlayerPerformanceResponse(raw)
      );
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};
