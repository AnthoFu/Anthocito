const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const WelcomeSchema = require("../../../models/WelcomeSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setwelcome")
        .setDescription("Configura el sistema de bienvenidas del servidor.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption((option) =>
            option.setName("estado").setDescription("Activar o desactivar el sistema de bienvenidas.").setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName("canal")
                .setDescription("Canal donde se enviarán las bienvenidas.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("mensaje")
                .setDescription("Mensaje de bienvenida. Usa {user} para mencionar al usuario.")
                .setRequired(false)
        ),

    async execute(client, interaction) {
        const { guild } = interaction;

        // Usamos directamente interaction.options para evitar errores de tipo
        const estado = interaction.options.getBoolean("estado");
        const canal = interaction.options.getChannel("canal");
        const mensaje = interaction.options.getString("mensaje");

        // Buscar o crear la configuración en la base de datos
        let welcomeData = await WelcomeSchema.findOne({ guildId: guild.id });

        if (!welcomeData) {
            welcomeData = new WelcomeSchema({ guildId: guild.id });
        }

        // Actualizar datos
        welcomeData.enabled = estado;
        if (canal) welcomeData.channelId = canal.id;
        if (mensaje) welcomeData.message = mensaje;

        await welcomeData.save();

        const embed = new EmbedBuilder()
            .setTitle("⚙️ Configuración de Bienvenidas")
            .setColor("Green")
            .setDescription(`Se ha actualizado la configuración de las bienvenidas en **${guild.name}**.`)
            .addFields(
                { name: "Estado", value: estado ? "✅ Activado" : "❌ Desactivado", inline: true },
                {
                    name: "Canal",
                    value: welcomeData.channelId ? `<#${welcomeData.channelId}>` : "No configurado",
                    inline: true
                },
                { name: "Mensaje", value: welcomeData.message }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
