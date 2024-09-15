const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "8ball",
    description: "Deja que anthocito responda tu pregunta. owo",
    options: [
        {
            name: "pregunta",
            description: "Hazle una pregunta a Anthocito",
            type: 3,  // Tipo 3 es STRING
            required: true
        }
    ],

    async execute(client, interaction) {
        const pgr = interaction.options.getString("pregunta");

        var respuestas = [
            "¡Sí!", 
            "No. o.o", 
            "No lo creo... <:en:1098945556459560970>", 
            "De hecho, hay un comic en chochox que lo explica <:fansdeoswucuando:1194025148089630850>", 
            "No lo sé, ¡Vuelve a preguntar! >.<", 
            "... Pregúntale a Antho", 
            "Obviamente, duh", 
            "¡Claro que no! ¿Cómo se te ocurre? put- <:callatenegro:1185273729278816296>", 
            "Yo creo que sí... <:en:1098945556459560970>",
            "Nuh uh!",
            "Yuh uh!"
        ];

        const botRespuesta = respuestas[Math.floor(Math.random() * respuestas.length)];

        const embed = new EmbedBuilder()
            .setColor("#FFFFFF") 
            .setDescription(`|Pregunta para: ${client.user.username}\n\n**Pregunta:** ${pgr} \n\n**Respuesta:** ${botRespuesta}`);

        await interaction.reply({ embeds: [embed] });
    }
};
