import {
  getChallengeLineupOverviewController,
  getChallengesOverviewController,
  getChallengesSelectionController,
  submitChallengeLineupController
} from "../../../../controllers/challenges.controllers.js";
import { requireKickbaseToken } from "../../../../middlewares/bearerToken.middlewares.js";

export default async function challengesRoutes(fastify) {
  fastify.get("/selection", {
    preHandler: [requireKickbaseToken],
    handler: getChallengesSelectionController.handler
  });

  fastify.get("/overview", {
    preHandler: [requireKickbaseToken],
    handler: getChallengesOverviewController.handler
  });

  fastify.get("/:challengeId/lineup/overview", {
    schema: getChallengeLineupOverviewController.schema,
    preHandler: [requireKickbaseToken],
    handler: getChallengeLineupOverviewController.handler
  });

  fastify.post("/:challengeId/lineup", {
    schema: submitChallengeLineupController.schema,
    preHandler: [requireKickbaseToken],
    handler: submitChallengeLineupController.handler
  });
}
