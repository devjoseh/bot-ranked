import { StringSelectMenuInteraction } from "discord.js";
import { createResponder, ResponderType } from "#base";
import { botConfigPanel } from "#functions";

interface Panel {
    handler: (interaction: StringSelectMenuInteraction) => Promise<any>;
}

const panels: Record<string, Panel> = {
    bot: { handler: botConfigPanel },
};

createResponder({
    customId: "central",
    types: [ ResponderType.StringSelect ],

    async run(interaction) {
        const option = interaction.values[0]

        const panel = panels[option]
        await panel.handler(interaction)
    }
})