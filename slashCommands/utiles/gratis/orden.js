const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const OrderSchema = require("../../../models/OrderSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("orden")
        .setDescription("Gestiona tus órdenes de cashback.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("nueva")
                .setDescription("Registra una nueva orden de compra para cashback.")
                .addStringOption((option) =>
                    option.setName("fecha").setDescription("Fecha de la orden (DD/MM/AAAA)").setRequired(true)
                )
                .addIntegerOption((option) =>
                    option.setName("cantidad").setDescription("Cantidad de items comprados").setRequired(true)
                )
                .addNumberOption((option) =>
                    option.setName("valor").setDescription("Valor total de la orden").setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("colaborador")
                        .setDescription("Menciona al colaborador (opcional)")
                        .setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("mis-ordenes").setDescription("Muestra el estado de tus órdenes actuales.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("vouch")
                .setDescription("Confirma que has recibido tu pago.")
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("ID de la orden (puedes verlo en /orden mis-ordenes).")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("comentario")
                        .setDescription("Un breve comentario sobre el servicio.")
                        .setRequired(false)
                )
        ),

    async execute(client, interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "nueva") {
            const fecha = interaction.options.getString("fecha");
            const cantidad = interaction.options.getInteger("cantidad");
            const valor = interaction.options.getNumber("valor");
            const colaboradorRaw = interaction.options.getString("colaborador");

            let collaboratorId = null;
            let collaboratorName = null;

            if (colaboradorRaw) {
                const mentionMatch = colaboradorRaw.match(/<@!?(\d+)>/);
                if (mentionMatch) {
                    [, collaboratorId] = mentionMatch;
                } else if (/^\d+$/.test(colaboradorRaw)) {
                    collaboratorId = colaboradorRaw;
                } else {
                    collaboratorName = colaboradorRaw;
                }

                if (collaboratorId && !collaboratorName) {
                    try {
                        const colabUser = await client.users.fetch(collaboratorId);
                        collaboratorName = colabUser.tag;
                    } catch (e) {
                        collaboratorName = `ID: ${collaboratorId}`;
                    }
                }
            }

            const newOrder = new OrderSchema({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                userName: interaction.user.tag,
                orderDate: fecha,
                quantity: cantidad,
                totalValue: valor,
                collaboratorId,
                collaboratorName,
                status: "pendiente"
            });

            await newOrder.save();

            const embed = new EmbedBuilder()
                .setTitle("✅ Orden Registrada")
                .setDescription(`<@${interaction.user.id}> ha registrado una nueva orden. Pendiente de aprobación.`)
                .addFields(
                    { name: "ID de la Orden", value: `\`${newOrder.id}\``, inline: true },
                    { name: "Fecha", value: fecha, inline: true },
                    { name: "Items", value: cantidad.toString(), inline: true },
                    { name: "Valor Total", value: `$${valor}`, inline: true }
                )
                .setColor("Green")
                .setTimestamp();

            if (collaboratorName) {
                embed.addFields({ name: "Colaborador", value: collaboratorName, inline: true });
            }

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "mis-ordenes") {
            const orders = await OrderSchema.find({ userId: interaction.user.id, guildId: interaction.guild.id })
                .sort({ createdAt: -1 })
                .limit(5);

            if (orders.length === 0) {
                return interaction.reply({ content: "No tienes ninguna orden registrada.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`📝 Órdenes de ${interaction.user.tag}`)
                .setColor("Blue")
                .setTimestamp();

            orders.forEach((order) => {
                const statusEmoji = {
                    pendiente: "⏳",
                    aprobada: "✅",
                    pagada: "💰",
                    finalizada: "🏁",
                    rechazada: "❌"
                };

                embed.addFields({
                    name: `Orden #${order.id.toString().slice(-6)} - ${statusEmoji[order.status]} ${order.status.toUpperCase()}`,
                    value: `**Fecha:** ${order.orderDate}\n**Items:** ${order.quantity}\n**Valor:** $${order.totalValue}\n**Neto:** ${order.status === "pendiente" ? "Por calcular" : `$${order.netPayout}`}\n**ID:** \`${order.id}\``
                });
            });

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "vouch") {
            const id = interaction.options.getString("id");
            const comentario = interaction.options.getString("comentario") || "¡Pago recibido correctamente! Gracias.";

            const order = await OrderSchema.findOne({ _id: id, userId: interaction.user.id });

            if (!order) {
                return interaction.reply({
                    content: "No se encontró ninguna orden con ese ID o no te pertenece.",
                    ephemeral: true
                });
            }

            if (order.status !== "pagada") {
                return interaction.reply({
                    content: `Solo puedes hacer un vouch para órdenes con estado **PAGADA**. Estado actual: **${order.status}**.`,
                    ephemeral: true
                });
            }

            order.status = "finalizada";
            await order.save();

            const vouchEmbed = new EmbedBuilder()
                .setTitle("⭐ ¡Nuevo Vouch! ⭐")
                .setColor("Gold")
                .setDescription(`"${comentario}"`)
                .addFields(
                    { name: "👤 Usuario", value: `<@${order.userId}>`, inline: true },
                    { name: "💰 Monto Recibido", value: `$${order.netPayout.toFixed(2)}`, inline: true },
                    { name: "📝 Orden ID", value: `\`${order.id}\``, inline: true }
                )
                .setTimestamp()
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: "Gracias por confiar en nuestro servicio." });

            return interaction.reply({
                content: `🎉 ¡Gracias <@${interaction.user.id}> por tu confianza!`,
                embeds: [vouchEmbed]
            });
        }

        return null;
    }
};
