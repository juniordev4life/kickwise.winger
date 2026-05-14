import { request } from "undici";
import { getKickbaseConfig } from "../../config/kickbase.config.js";
import { mapKickbaseError } from "../helpers/kickbaseError.helpers.js";

const SLEEP = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Perform an HTTP call against the Kickbase API with simple retry/backoff.
 *
 * Only retries on transient 5xx and 429 — 4xx errors (including 401) are surfaced
 * immediately so the caller can react appropriately (re-auth, validation).
 *
 * @param {object} options request options
 * @param {string} options.method HTTP method
 * @param {string} options.path API path beginning with `/` (e.g. "/v4/user/login")
 * @param {object} [options.body] optional JSON body
 * @param {string} [options.token] optional Kickbase bearer token
 * @param {import("fastify").FastifyBaseLogger} [options.log] optional logger
 * @returns {Promise<any>} parsed JSON response from Kickbase
 *
 * @example
 *   const data = await kickbaseRequest({ method: "POST", path: "/v4/user/login", body });
 */
export async function kickbaseRequest({ method, path: apiPath, body, token, log }) {
  const config = getKickbaseConfig();
  const url = new URL(apiPath, config.baseUrl).toString();
  const headers = {
    "content-type": "application/json",
    accept: "application/json",
    "user-agent": "kickwise-winger/0.1"
  };
  if (token) headers.authorization = `Bearer ${token}`;

  let lastError;
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await request(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        bodyTimeout: config.timeoutMs,
        headersTimeout: config.timeoutMs
      });
      const text = await response.body.text();

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return text ? JSON.parse(text) : {};
      }

      const error = mapKickbaseError(
        { status: response.statusCode, statusText: response.statusCode.toString() },
        text
      );

      if (response.statusCode === 429 || response.statusCode >= 500) {
        lastError = error;
        const backoff = 200 * 2 ** (attempt - 1);
        log?.warn(
          { url, attempt, statusCode: response.statusCode, backoff },
          "Kickbase upstream transient error, retrying"
        );
        await SLEEP(backoff);
        continue;
      }
      throw error;
    } catch (err) {
      if (err.kickbase) throw err;
      lastError = err;
      const backoff = 200 * 2 ** (attempt - 1);
      log?.warn({ url, attempt, err: err.message, backoff }, "Kickbase network error, retrying");
      await SLEEP(backoff);
    }
  }
  throw lastError ?? new Error("Kickbase request failed without specific error");
}
