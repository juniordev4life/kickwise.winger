import {
  getLeagueMeController,
  getLeagueRankingController,
  getMyLeaguesController
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
}
