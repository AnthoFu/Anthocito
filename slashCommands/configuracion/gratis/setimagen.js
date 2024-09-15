const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "setimagen",
    description: "Poner una imagen animada al bot",
    options: [
        {
            name: "imagen",
            description: "Selecciona la imagen",
            type: 11, // Attachment type
            required: true
        }
    ],

    async execute(client, interaction) {
        // Verificar si el ID del usuario coincide con tu ID
        if (interaction.user.id !== '459569274697285642') {
            return interaction.reply({ content: "No tienes permiso para usar este comando.", ephemeral: true });
        }

        const avatar = interaction.options.getAttachment("imagen");

        // Responder de manera diferida mientras se cambia el avatar
        await interaction.deferReply();

        try {
            // Cambiar el avatar del bot
            await client.user.setAvatar(avatar.url);

            // Enviar la respuesta una vez que el avatar ha sido cambiado
            await interaction.editReply({ content: "La imagen ha sido cargada con éxito, felicidades, eres un genio (Mentira)" });
        } catch (error) {
            console.error(error);
            // En caso de error, envía una respuesta de error
            await interaction.editReply({ content: "Ocurrió un error al intentar cambiar la imagen." });
        }
    }
};
