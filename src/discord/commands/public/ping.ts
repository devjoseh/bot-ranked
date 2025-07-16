import { ApplicationCommandType } from "discord.js";
import { createCommand } from "#base";

createCommand({
	name: "ping",
	description: "Replies with pong 🏓",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.reply({ content: `Pong! ${Date.now() - interaction.createdTimestamp}ms` });
	}
});
 