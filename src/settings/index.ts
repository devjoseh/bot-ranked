import settings from "../../settings.json" with { type: "json" };
import { validateEnv } from "./env.validate.js";
import { envSchema } from "./env.schema.js";
import { logger } from "./logger.js";
export * from "./error.js";
import "./global.js";

const env = validateEnv(envSchema);

export { settings, logger, env };