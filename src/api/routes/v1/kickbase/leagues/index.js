import {
  getLeagueMeController,
  getLeagueRankingController,
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

  fastify.post("/:leagueId/lineup", {
    schema: setLineupController.schema,
    preHandler: [requireKickbaseToken],
    handler: setLineupController.handler
  });
}
