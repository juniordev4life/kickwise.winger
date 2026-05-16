import {
  getCurrentLineupController,
  getLeagueMeController,
  getLeagueRankingController,
  getMyBudgetController,
  getMyLeaguesController,
  setLineupController
} from "../../../../controllers/leagues.controllers.js";
import { requireKickbaseToken } from "../../../../middlewares/bearerToken.middlewares.js";

export default async function leaguesRoutes(fastify) {
  fastify.get("/", {
    preHandler: [requireKickbaseToken],
    handler: getMyLeaguesController.handler
  });

  fastify.get("/:leagueId/ranking", {
    schema: getLeagueRankingController.schema,
    preHandler: [requireKickbaseToken],
    handler: getLeagueRankingController.handler
  });

  fastify.get("/:leagueId/me", {
    schema: getLeagueMeController.schema,
    preHandler: [requireKickbaseToken],
    handler: getLeagueMeController.handler
  });

  fastify.get("/:leagueId/me/budget", {
    schema: getMyBudgetController.schema,
    preHandler: [requireKickbaseToken],
    handler: getMyBudgetController.handler
  });

  fastify.post("/:leagueId/lineup", {
    schema: setLineupController.schema,
    preHandler: [requireKickbaseToken],
    handler: setLineupController.handler
  });

  fastify.get("/:leagueId/lineup", {
    schema: getCurrentLineupController.schema,
    preHandler: [requireKickbaseToken],
    handler: getCurrentLineupController.handler
  });
}
