import { getSquadController } from "../../../../controllers/squad.controllers.js";
import { requireKickbaseToken } from "../../../../middlewares/bearerToken.middlewares.js";

export default async function squadRoutes(fastify) {
  fastify.get("/:leagueId", {
    schema: getSquadController.schema,
    preHandler: [requireKickbaseToken],
    handler: getSquadController.handler
  });
}
