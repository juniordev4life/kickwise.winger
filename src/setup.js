import path from "node:path";
import autoload from "@fastify/autoload";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { handleErrorResponse } from "./api/helpers/responseHandler.helpers.js";

/**
 * Wire all plugins, hooks, and route auto-loading onto the given Fastify server.
 *
 * @param {import("fastify").FastifyInstance} server fastify instance to configure
 * @param {{ __dirname: string }} ctx caller's __dirname so autoload knows where it lives
 */
export async function configureServer(server, { __dirname }) {
  await server.register(helmet, { contentSecurityPolicy: false });
  await server.register(cors, { origin: false });
  await server.register(rateLimit, {
    max: 300,
    timeWindow: "1 minute"
  });

  server.setErrorHandler((error, request, reply) => handleErrorResponse(reply, error, request));

  server.get("/health", async () => ({
    service: "winger",
    status: "ok",
    timestamp: new Date().toISOString()
  }));

  await server.register(autoload, {
    dir: path.join(__dirname, "api", "routes"),
    options: { prefix: "/api" }
  });
}
