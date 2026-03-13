import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../../../interfaces/Command";
import { CustomClient } from "../../../index";

const command: SlashCommand = {
    name: "ping",
    description: "Comando para saber la latencia con el bot",

    async execute(client: CustomClient, interaction: ChatInputCommandInteraction) {
        const ping = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder().setColor("Purple").setDescription(`Ping => ${ping}`);

        interaction.reply({ embeds: [embed] });
    }
};

export default command;
