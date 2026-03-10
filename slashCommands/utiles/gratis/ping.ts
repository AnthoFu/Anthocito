import { Client, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default {
    name: "ping",
    description: "Comando para saber la latencia con el bot",

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const ping = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder().setColor("Purple").setDescription(`Ping => ${ping}`);

        interaction.reply({ embeds: [embed] });
    }
};
