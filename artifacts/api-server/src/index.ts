import app from "./app";
import { logger } from "./lib/logger";
import { initAuthSchema, seedAdminUser } from "./lib/auth-db";
import { initExtendedSchema } from "./lib/extended-db";

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
  await initExtendedSchema();

  const seedEmail = process.env["SEED_ADMIN_EMAIL"];
  const seedPassword = process.env["SEED_ADMIN_PASSWORD"];

  if (seedEmail && seedPassword) {
    await seedAdminUser({
      email: seedEmail,
      password: seedPassword,
      fullName: process.env["SEED_ADMIN_FULLNAME"] ?? "Admin",
    });
    logger.info("Admin seed: completed (idempotent)");
  } else {
    logger.info("Admin seed: skipped (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set)");
  }
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
