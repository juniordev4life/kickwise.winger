import {
  getCompetitionTableController,
  getPlayerDetailController,
  getPlayerPerformanceController,
  getTeamProfileController
} from "../../../../controllers/competitions.controllers.js";
import { requireKickbaseToken } from "../../../../middlewares/bearerToken.middlewares.js";

export default async function competitionsRoutes(fastify) {
  fastify.get("/:competitionId/table", {
    schema: getCompetitionTableController.schema,
    preHandler: [requireKickbaseToken],
    handler: getCompetitionTableController.handler
  });

  fastify.get("/:competitionId/teams/:teamId/profile", {
    schema: getTeamProfileController.schema,
    preHandler: [requireKickbaseToken],
    handler: getTeamProfileController.handler
  });

  fastify.get("/:competitionId/players/:playerId", {
    schema: getPlayerDetailController.schema,
    preHandler: [requireKickbaseToken],
    handler: getPlayerDetailController.handler
  });

  fastify.get("/:competitionId/players/:playerId/performance", {
    schema: getPlayerPerformanceController.schema,
    preHandler: [requireKickbaseToken],
    handler: getPlayerPerformanceController.handler
  });
}
