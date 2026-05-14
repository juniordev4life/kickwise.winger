import { buildServer } from "./server.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const host = process.env.HOST ?? "0.0.0.0";

const server = await buildServer();

try {
  await server.listen({ port, host });
} catch (error) {
  server.log.error({ err: error }, "Winger failed to start");
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    server.log.info({ signal }, "Winger shutting down");
    await server.close();
    process.exit(0);
  });
}
