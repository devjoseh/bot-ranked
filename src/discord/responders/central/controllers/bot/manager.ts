import { StringSelectMenuInteraction, TextInputStyle } from "discord.js";
import { createModalFields, centralPanel } from "#functions";
import { createResponder, ResponderType } from "#base";

interface Panel {
    handler: (interaction: StringSelectMenuInteraction) => Promise<any>;
}

const panels: Record<string, Panel> = {
    name: { handler: showNameModal },
    back: { handler: (interaction) => centralPanel(interaction, true) },
};

createResponder({
    customId: "central/config/bot",
    types: [ResponderType.StringSelect],

    async run(interaction) {
        const option = interaction.values[0];

        const panel = panels[option];
        await panel.handler(interaction);
    },
});

async function showNameModal(interaction: StringSelectMenuInteraction) {
    await interaction.showModal({
        customId: `central/config/bot/name`,
        title: "📝 Alterar Nome do Bot",
        components: createModalFields({
            name: {
                label: "Novo nome",
                placeholder: "Digite o novo nome do bot",
                maxLength: 32,
                style: TextInputStyle.Short,
                required,
            },
        })
    })
}