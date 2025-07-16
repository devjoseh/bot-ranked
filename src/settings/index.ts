import settings from "../../settings.json" with { type: "json" };
import { validateEnv } from "./env.validate.js";
import { envSchema } from "./env.schema.js";
import { logger } from "./logger.js";
export * from "./error.js";
import "./global.js";

import moment from 'moment-timezone'
moment.locale("pt-br")
moment.tz.setDefault("America/Sao_Paulo")

const env = validateEnv(envSchema);

export { settings, logger, env, moment };