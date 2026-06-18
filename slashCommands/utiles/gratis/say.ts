import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../../interfaces/Command";
import { CustomClient } from "../../../index";

const command: SlashCommand = {
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

    async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {
        const botRespuesta = interaction.options.getString("mensaje")!;
        await interaction.reply(botRespuesta);
    }
};

export default command;
