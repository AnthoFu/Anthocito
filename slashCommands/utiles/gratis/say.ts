import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction } from "discord.js";

export default {
    name: "say",
    description: "El bot dirá lo que tú quieras.",
    options: [
        {
            name: "mensaje",
            description: "Mensaje que dirá el bot.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const botRespuesta = interaction.options.getString("mensaje")!;
        await interaction.reply(botRespuesta);
    }
};
