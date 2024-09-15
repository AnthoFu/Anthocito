const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch")

module.exports = {
    name: "setbanner",
    description:"Cambiar el banner del perfil del bot, solo el Antho puede hacerlo",
    options: [
        {
            name:"banner",
            description:"Selecciona el banner",
            required:true,
            type:11
        }
    ],

    async execute(client, interaction) {
        // Verificar si el ID del usuario coincide con tu ID
        if (interaction.user.id !== '459569274697285642') {
            return interaction.reply({ content: "No tienes permiso para usar este comando.", ephemeral: true });
        }
        

        const banner = interaction.options.getAttachment("banner")
        const response = await fetch(banner.url)
        const buffer = await response.buffer()
        const base64 = buffer.toString("base64")
        const imageData = `data:${banner.contentType};base64,${base64}`
        
        const patchResponse = await fetch("https://discord.com/api/v10/users/@me",{
            method:"PATCH",
            headers: {
                Authorization: `Bot ${client.token}`,
                "Content-Type": "application/json,"

            },
            body: JSON.stringify ({ banner: imageData}),
        })

        await interaction.reply ({ content: "El banner ha sido cambiado con exito, ya sabia que eras god antho. uwu"})
    }
}
