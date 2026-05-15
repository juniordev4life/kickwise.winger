import { handleErrorResponse, setGeneralResponse } from "../helpers/responseHandler.helpers.js";
import { kickbaseRequest } from "../services/kickbaseClient.services.js";

const challengeParamsSchema = {
  type: "object",
  required: ["challengeId"],
  properties: {
    challengeId: { type: "string", minLength: 1 }
  }
};

/**
 * GET /api/v1/kickbase/challenges/selection — list of challenges the
 * authenticated user can join right now (Kickbase Arena mode). Pass-through
 * to /v4/challenges/selection.
 */
export const getChallengesSelectionController = {
  handler: async (request, reply) => {
    try {
      const raw = await kickbaseRequest({
        method: "GET",
        path: "/v4/challenges/selection",
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(reply, 200, "Success", "Challenges selection", raw ?? {});
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

/**
 * GET /api/v1/kickbase/challenges/overview — all challenges visible to the
 * user (active + past). Pass-through.
 */
export const getChallengesOverviewController = {
  handler: async (request, reply) => {
    try {
      const raw = await kickbaseRequest({
        method: "GET",
        path: "/v4/challenges/overview",
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(reply, 200, "Success", "Challenges overview", raw ?? {});
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

/**
 * GET /api/v1/kickbase/challenges/:id/lineup/overview — current lineup +
 * meta for a specific challenge. Useful to discover the participant id
 * (`pi`) and group id (`gid`) needed for the submit body.
 */
export const getChallengeLineupOverviewController = {
  schema: { params: challengeParamsSchema },
  handler: async (request, reply) => {
    try {
      const { challengeId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/challenges/${encodeURIComponent(challengeId)}/lineup/overview`,
        token: request.kickbaseToken,
        log: request.log
      });
      return setGeneralResponse(reply, 200, "Success", "Challenge lineup overview", raw ?? {});
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};

const submitChallengeLineupBodySchema = {
  type: "object",
  required: ["type", "players"],
  properties: {
    type: { type: "string", minLength: 3 },
    players: {
      type: "array",
      minItems: 11,
      maxItems: 11,
      items: { type: "string", minLength: 1 }
    },
    pi: { type: ["string", "null"] },
    gid: { type: ["string", "null"] }
  }
};

/**
 * POST /api/v1/kickbase/challenges/:id/lineup — submit a lineup for a
 * Kickbase Arena challenge. Forwards to /v4/challenges/{id}/join with the
 * documented body shape:
 *   { lud: { lt: "4-4-2", pls: ["1234", ...] }, pi: "...", gid: "..." }
 *
 * `pi` and `gid` are passed through verbatim — we don't know their exact
 * semantics yet, so the caller is responsible for sourcing them (e.g. from
 * GET .../lineup/overview).
 */
export const submitChallengeLineupController = {
  schema: { params: challengeParamsSchema, body: submitChallengeLineupBodySchema },
  handler: async (request, reply) => {
    try {
      const { challengeId } = request.params;
      const body = {
        lud: {
          lt: request.body.type,
          pls: request.body.players
        }
      };
      if (request.body.pi) body.pi = request.body.pi;
      if (request.body.gid) body.gid = request.body.gid;

      const raw = await kickbaseRequest({
        method: "POST",
        path: `/v4/challenges/${encodeURIComponent(challengeId)}/join`,
        token: request.kickbaseToken,
        body,
        log: request.log
      });
      return setGeneralResponse(reply, 200, "Success", "Challenge lineup submitted", raw ?? {});
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};
