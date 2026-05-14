import { handleErrorResponse, setGeneralResponse } from "../helpers/responseHandler.helpers.js";
import { loginBodySchema } from "../schemas/auth.schemas.js";
import { kickbaseRequest } from "../services/kickbaseClient.services.js";
import { normalizeLoginResponse } from "../services/normalizer.services.js";

export const loginController = {
  schema: { body: loginBodySchema },
  handler: async (request, reply) => {
    try {
      const raw = await kickbaseRequest({
        method: "POST",
        path: "/v4/user/login",
        body: { em: request.body.email, pass: request.body.password },
        log: request.log
      });
      const normalized = normalizeLoginResponse(raw);
      return setGeneralResponse(reply, 200, "Success", "Login successful", normalized);
    } catch (error) {
      return handleErrorResponse(reply, error, request);
    }
  }
};
