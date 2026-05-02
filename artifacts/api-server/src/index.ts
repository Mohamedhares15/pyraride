import app from "./app";
import { logger } from "./lib/logger";
import { initAuthSchema, seedAdminUser } from "./lib/auth-db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function bootstrap() {
  await initAuthSchema();
  await seedAdminUser({
    email: "admin@pyrarides.com",
    password: "Admin@2026",
    fullName: "Admin User",
  });
}

bootstrap()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to bootstrap server");
    process.exit(1);
  });
