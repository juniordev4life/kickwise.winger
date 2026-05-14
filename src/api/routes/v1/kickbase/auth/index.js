import { loginController } from "../../../../controllers/auth.controllers.js";

export default async function authRoutes(fastify) {
  fastify.post("/login", {
    schema: loginController.schema,
    handler: loginController.handler
  });
}
