/**
 * Map a fetch-style response from Kickbase into a Kickwise error object with
 * statusCode, title, and a hopefully-useful message.
 *
 * @param {Response} response the fetch Response object (already failed)
 * @param {string} bodyText raw response body text
 * @returns {Error} an Error annotated with statusCode/title for handleErrorResponse
 *
 * @example
 *   if (!response.ok) throw mapKickbaseError(response, await response.text());
 */
export function mapKickbaseError(response, bodyText) {
  const statusCode = response.status;
  let title = "Kickbase Error";
  let message = bodyText || response.statusText;

  if (statusCode === 401) {
    title = "Kickbase Unauthorized";
    message = "Kickbase token rejected — re-authentication required.";
  } else if (statusCode === 403) {
    title = "Kickbase Forbidden";
  } else if (statusCode === 429) {
    title = "Kickbase Rate Limited";
  } else if (statusCode >= 500) {
    title = "Kickbase Upstream Error";
  }

  const error = new Error(message);
  error.statusCode = statusCode;
  error.title = title;
  error.kickbase = true;
  return error;
}
