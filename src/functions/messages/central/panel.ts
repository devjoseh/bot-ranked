import { ActionRowBuilder, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { settings } from "#settings";

const centralOptions: { label: string; description: string; value: string; }[] = [
    { label: "Criar Filas", description: "Configure a criação de Filas", value: "create_queue" },
    { label: "Permissões Ranked", description: "Configure as Permissões Ranked", value: "ranked_perms" },
    { label: "Canais Filas", description: "Configure os Canais das Filas", value: "queue_channels" },
    { label: "Pontos", description: "Configure os Pontos do Bot", value: "points" },
    { label: "Embeds", description: "Configure as Embeds", value: "embeds" },
    { label: "Botões", description: "Configure os Botões", value: "buttons" },
    { label: "Logs", description: "Configure as Logs", value: "logs" },
    { label: "Bot", description: "Configure o Bot", value: "bot" },
]

export async function centralPanel(
    interaction: ChatInputCommandInteraction|StringSelectMenuInteraction, 
    back?: boolean
) {
    back ? null : await interaction.deferReply({ flags })

    const { client } = interaction;

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
        new StringSelectMenuBuilder({
            customId: `central`,
            placeholder: `Selecione a central.`,
            options: centralOptions
        })
    )

    const embed = new EmbedBuilder()
    .setColor(settings.colors.beige as ColorResolvable)
    .setFooter({ text: settings.messages.footer, iconURL: client.user.displayAvatarURL()})
    .setThumbnail(interaction.guild!.iconURL({ forceStatic: false }))
    .setTimestamp(new Date())
    .setTitle(`Central de Controle`)
    .setDescription(`Configure tudo do seu bot aqui!\nSelecione, abaixo, qual central deseja acessar.`)
    back 
        ? await (interaction as StringSelectMenuInteraction).update({ embeds: [embed], components: [row] })
        : await interaction.editReply({ embeds: [embed], components: [row] })
}