const fetch = require("node-fetch");

module.exports = {
    name: "setbanner",
    description: "Cambiar el banner del perfil del bot, solo el Antho puede hacerlo",
    options: [
        {
            name: "banner",
            description: "Selecciona el banner",
            required: true,
            type: 11
        }
    ],

    async execute(client, interaction) {
        // Verificar si el ID del usuario coincide con el SUPER_ADMIN_ID en el .env
        if (interaction.user.id !== process.env.SUPER_ADMIN_ID) {
            await interaction.reply({ content: "No tienes permiso para usar este comando.", ephemeral: true });
            return;
        }

        const banner = interaction.options.getAttachment("banner");

        // Responder de manera diferida para evitar el error de "Unknown interaction" (timeout de 3 segundos)
        await interaction.deferReply();

        try {
            const response = await fetch(banner.url);
            const buffer = await response.buffer();
            const base64 = buffer.toString("base64");
            const imageData = `data:${banner.contentType};base64,${base64}`;

            await fetch("https://discord.com/api/v10/users/@me", {
                method: "PATCH",
                headers: {
                    Authorization: `Bot ${client.token}`,
                    "Content-Type": "application/json,"
                },
                body: JSON.stringify({ banner: imageData })
            });

            await interaction.editReply({
                content: "El banner ha sido cambiado con exito, ya sabia que eras god antho. uwu"
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "Ocurrió un error al intentar cambiar el banner." });
        }

        console.log(` | Se ha utilizado el comando ${this.name}`);
    }
};
