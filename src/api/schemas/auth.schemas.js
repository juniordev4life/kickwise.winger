export const loginBodySchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email", minLength: 3, maxLength: 200 },
    password: { type: "string", minLength: 1, maxLength: 200 }
  },
  additionalProperties: false
};

export const loginResponseSchema = {
  200: {
    type: "object",
    properties: {
      traceId: { type: ["string", "null"] },
      code: { type: "number" },
      title: { type: "string" },
      message: { type: "string" },
      data: {
        type: "object",
        properties: {
          token: { type: "string" },
          tokenExpiry: { type: ["string", "null"] },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              avatarUrl: { type: ["string", "null"] },
              leagues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" }
                  }
                }
              }
            }
          }
        }
      },
      errors: { type: "array" }
    }
  }
};
