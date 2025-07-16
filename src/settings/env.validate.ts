import { z, ZodObject, ZodRawShape } from "zod";
import { linesBuilder } from "#functions";
import { logger } from "./logger.js";
import ck from "chalk";

export function validateEnv<T extends ZodRawShape>(schema: ZodObject<T>) {
    const result = schema.loose().safeParse(process.env);
    
    if (!result.success) {
        const u = ck.underline;

        for (const error of result.error.issues) {
            const { path, message } = error;
            logger.error(`ENV VAR → ${u.bold(path)} ${message}`);

            if (error.code == "invalid_type") {
                logger.log(ck.dim(`└ "Esperado: ${u.green(error.expected)} | Recebido: ${u.red(error.input)}`));
            }
        }

        logger.log();
        logger.warn(linesBuilder(`Algumas ${ck.magenta("Variáveis de ambiente")} não foram definidas.`,));
        process.exit(1);
    }

    logger.log(ck.green(`${ck.magenta("☰ Variáveis de ambiente")} carregadas ✓`));

    type EnvSchema = z.infer<typeof schema>;
    
    type EnvVars = EnvSchema & Record<string, string>;

    return result.data as EnvVars;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv { "Use import { env } from \"#settings\"": never }
    }
}