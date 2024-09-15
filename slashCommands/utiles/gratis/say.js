const {EmbedBuilder} = require("discord.js");

module.exports = {
    name: "say",
    description: "El bot dirá lo que tú quieras.",
    options: [
        {
            name: "mensaje",
            description: "Mensaje que dirá el bot.",
            type: 3,
            required: true
        }
    ],

    async execute(client, interaction) {
        const botRespuesta = interaction.options.getString("mensaje");
        await interaction.reply(botRespuesta);
    }
}
