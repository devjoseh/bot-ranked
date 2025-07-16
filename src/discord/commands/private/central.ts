import { ApplicationCommandType } from "discord.js";
import { createCommand } from "#base";
import { centralPanel } from "#functions";

createCommand({
    name: "central",
    description: "[ADMIN] Acessar a central de controle do bot.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [ "Administrator" ],
    async run(interaction) {
        await centralPanel(interaction)
    }
});
 