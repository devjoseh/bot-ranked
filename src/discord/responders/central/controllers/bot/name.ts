import { botConfigPanel, modalFieldsToRecord } from "#functions";
import { createResponder, ResponderType } from "#base";
import { baseErrorHandler } from "#settings";
import { z } from "zod";

const dataSchema = z.object({
    name: z.string()
})

createResponder({
    customId: "central/config/bot/name",
    types: [ ResponderType.ModalComponent ],

    async run(interaction) {
        await interaction.deferReply({ flags })
        
        const data = dataSchema.parse(modalFieldsToRecord(interaction.fields))

        try {
            await Promise.all([
                interaction.guild?.members.me?.setNickname(data.name),
                botConfigPanel(interaction, `✅ O nome do bot foi alterado para **${data.name}** com sucesso.\n\n`, true)
            ])
        } catch (error: any) {
            if(error.message.includes("You are changing your username or Discord Tag too fast.")) {
                await botConfigPanel(interaction, "🚨 Você está alterando o nome do bot muito rápido. Por favor, tente novamente mais tarde.", true)
            } else {
                await baseErrorHandler(error, interaction.client)
            }
        }
    }
})