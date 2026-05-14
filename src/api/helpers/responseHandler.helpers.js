/**
 * Build the standard Kickwise API envelope and send it via the given reply.
 *
 * @param {import("fastify").FastifyReply} reply Fastify reply
 * @param {number} code HTTP status code
 * @param {string} title short human label, e.g. "Success"
 * @param {string} message details for the consumer
 * @param {*} data response payload (defaults to {})
 * @returns {import("fastify").FastifyReply} reply for chaining
 *
 * @example
 *   return setGeneralResponse(reply, 200, "Success", "Login successful", { token });
 */
export function setGeneralResponse(reply, code, title, message, data = {}) {
  return reply.status(code).send({
    traceId: reply.request?.id ?? null,
    code,
    title,
    message,
    data,
    errors: []
  });
}

/**
 * Convert an error into the standard Kickwise error envelope.
 *
 * Recognizes:
 *   - Fastify validation errors (statusCode + validation array)
 *   - explicit error.statusCode
 *   - kickbase-mapped errors with `error.kickbase = true`
 *
 * @param {import("fastify").FastifyReply} reply Fastify reply
 * @param {Error} error the thrown error
 * @param {import("fastify").FastifyRequest} request the originating request (for logging)
 * @returns {import("fastify").FastifyReply}
 *
 * @example
 *   try { await doIt(); }
 *   catch (err) { return handleErrorResponse(reply, err, request); }
 */
export function handleErrorResponse(reply, error, request) {
  const statusCode = error.statusCode ?? 500;
  const errors = error.validation
    ? error.validation.map((v) => v.message ?? JSON.stringify(v))
    : [error.message ?? "Unknown error"];

  if (statusCode >= 500) {
    request?.log?.error({ err: error }, "Unhandled error in Winger");
  } else {
    request?.log?.warn({ err: error }, "Handled error in Winger");
  }

  return reply.status(statusCode).send({
    traceId: request?.id ?? null,
    code: statusCode,
    title: error.title ?? (statusCode >= 500 ? "Server Error" : "Bad Request"),
    message: error.message ?? "Unknown error",
    data: {},
    errors
  });
}
