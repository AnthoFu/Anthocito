const { Events, EmbedBuilder } = require("discord.js");
const WelcomeSchema = require("../../models/WelcomeSchema");

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Buscar configuración en la base de datos
        const welcomeData = await WelcomeSchema.findOne({ guildId: member.guild.id });

        if (!welcomeData || !welcomeData.enabled || !welcomeData.channelId) return;

        // Obtener el canal
        const channel = member.guild.channels.cache.get(welcomeData.channelId);
        if (!channel) return;

        // Reemplazar marcador de posición {user}
        const welcomeMessage = welcomeData.message.replace("{user}", `<@${member.user.id}>`);

        // Crear el mensaje (opcionalmente un Embed)
        const embed = new EmbedBuilder()
            .setTitle("✨ ¡Nuevo Miembro!")
            .setDescription(welcomeMessage)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor("Random")
            .setTimestamp()
            .setFooter({ text: `Miembro #${member.guild.memberCount}`, iconURL: member.guild.iconURL() });

        // Enviar al canal
        channel.send({ content: `<@${member.user.id}>`, embeds: [embed] }).catch((err) => console.error(` | [Error] No se pudo enviar el mensaje de bienvenida: ${err}`));
    },
};
