/**
 * Extract the Kickbase Bearer token from the Authorization header and attach
 * it to `request.kickbaseToken`. Used by all endpoints that need to talk to
 * Kickbase on behalf of a Kickwise user.
 *
 * The Winger never validates the token itself — Kickbase decides.
 *
 * @param {import("fastify").FastifyRequest} request request
 * @param {import("fastify").FastifyReply} reply reply
 * @returns {Promise<void>}
 *
 * @example
 *   fastify.get("/...", { preHandler: [requireKickbaseToken] }, handler);
 */
export async function requireKickbaseToken(request, reply) {
  const header = request.headers.authorization ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return reply.status(401).send({
      traceId: request.id,
      code: 401,
      title: "Missing Kickbase Token",
      message: "Authorization: Bearer <kickbase-token> header required.",
      data: {},
      errors: ["Authorization header missing or malformed"]
    });
  }

  request.kickbaseToken = match[1];
}
