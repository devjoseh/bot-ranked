import { ActionRowBuilder, ColorResolvable, EmbedBuilder, ModalMessageModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { settings } from "#settings";

const centralOptions: { label: string; description: string; value: string; }[] = [
    { label: "Nome do Bot", description: "Alterar o nome do bot", value: "name" },
    { label: "Foto de Perfil", description: "Alterar a foto de perfil do bot", value: "avatar" },
    { label: "Atividade", description: "Alterar a atividade/status do bot", value: "activity" },
    { label: "Voltar", description: "Retornar ao menu principal", value: "back" },
]

export async function botConfigPanel(
    interaction: StringSelectMenuInteraction|ModalMessageModalSubmitInteraction,
    contentMessage?: string,
    editMessage?: boolean
) {
    const { client } = interaction;

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder({
                customId: `central/config/bot`,
                placeholder: `Selecione uma opção para configurar o bot.`,
                options: centralOptions
            })
        )
    
    const embed = new EmbedBuilder()
    .setColor(settings.colors.beige as ColorResolvable)
    .setFooter({ text: settings.messages.footer, iconURL: client.user.displayAvatarURL()})
    .setThumbnail(interaction.client.user.displayAvatarURL() || interaction.client.user.avatarURL())
    .setTimestamp(new Date())
    .setTitle(`Configurações do Bot`)
    .setDescription(`Selecione abaixo o que deseja configurar no bot.`)
    .addFields(
        { name: "Nome:", value: `${interaction.client.user.displayName}` }
    )
    
    editMessage
        ? await interaction.editReply({ embeds: [embed], components: [row], content: contentMessage ? contentMessage + "­­\n " : null })
        : await interaction.update({ embeds: [embed], components: [row], content: contentMessage ? contentMessage + "­­\n " : null });
}