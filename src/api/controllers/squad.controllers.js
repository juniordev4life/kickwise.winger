import { handleErrorResponse, setGeneralResponse } from "../helpers/responseHandler.helpers.js";
import { leagueParamsSchema } from "../schemas/leagues.schemas.js";
import { kickbaseRequest } from "../services/kickbaseClient.services.js";
import { normalizeSquadResponse } from "../services/normalizer.services.js";

export const getSquadController = {
  schema: { params: leagueParamsSchema },
  handler: async (request, reply) => {
    try {
      const { leagueId } = request.params;
      const raw = await kickbaseRequest({
        method: "GET",
        path: `/v4/leagues/${encodeURIComponent(leagueId)}/squad`,
        token: request.kickbaseToken,
        log: request.log
      });
      const normalized = normalizeSquadResponse({ ...raw, lgid: leagueId });
      return setGeneralResponse(reply, 200, "Success", "Squad retrieved", normalized);
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};
