import { type Client, codeBlock, EmbedBuilder, WebhookClient } from "discord.js";
import { linesBuilder, limitText, replaceText } from "#functions";
import settings from "../../settings.json" with { type: "json" };
import { logger } from "./logger.js";
import { env } from "#settings";
import ck from "chalk";

export async function baseErrorHandler(error: any, client: Client<true>) {
    if (client?.user) logger.log(client.user.displayName);

    const errorMessage: string[] = [];

    const hightlight = (text: string) => text
    .replace(/\(([^)]+)\)/g, (_, match) =>  ck.gray(`(${ck.cyan(match)})`));

    if ("message" in error) errorMessage.push(ck.red(`${error.message}`)); 
    if ("stack" in error) {
        const formated = replaceText(String(error.stack), { 
            [__rootname]: ".", 
            "at ": ck.gray("at ")
        });
        errorMessage.push(limitText(hightlight(formated), 3500, "..."));
    }
    
    logger.error(linesBuilder(errorMessage));

    if (!env.WEBHOOK_LOGS_URL) return;

    const embed = new EmbedBuilder()
    .setTitle(settings.messages.title)
    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
    .setDescription(codeBlock("ts", linesBuilder(errorMessage)))
    new WebhookClient({ url: process.env.WEBHOOK_LOGS_URL! }).send({ embeds: [embed] }).catch(logger.error);
}

function exit() {
    logger.log("")
    logger.log(ck.dim("👋 Até mais"));
    logger.log("")
    process.exit(0);
}

process.on("SIGINT", exit);
process.on("SIGTERM", exit);