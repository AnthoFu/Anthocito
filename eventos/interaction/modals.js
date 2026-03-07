const { EmbedBuilder } = require("discord.js");
const OrderSchema = require("../../models/OrderSchema");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === "modal_nueva_orden") {
            const fecha = interaction.fields.getTextInputValue("fecha_orden");
            const cantidad = parseInt(interaction.fields.getTextInputValue("cantidad_items"), 10);
            const valor = parseFloat(interaction.fields.getTextInputValue("valor_total"));
            const colaboradorRaw = interaction.fields.getTextInputValue("colaborador");

            if (Number.isNaN(cantidad) || Number.isNaN(valor)) {
                await interaction.reply({
                    content: "Por favor, ingresa valores numéricos válidos para la cantidad y el valor total.",
                    ephemeral: true
                });
                return;
            }

            let collaboratorId = null;
            let collaboratorName = null;

            if (colaboradorRaw) {
                // Intentar extraer ID de una mención <@!123> o <@123>
                const mentionMatch = colaboradorRaw.match(/<@!?(\d+)>/);
                if (mentionMatch) {
                    [, collaboratorId] = mentionMatch;
                } else if (/^\d+$/.test(colaboradorRaw)) {
                    collaboratorId = colaboradorRaw;
                } else {
                    collaboratorName = colaboradorRaw;
                }

                // Si tenemos ID, intentar obtener el nombre para que quede bonito en la DB
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
                .setDescription("Tu orden ha sido registrada correctamente y está a la espera de aprobación.")
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

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Opcional: Notificar a los administradores en un canal específico
            // Aquí podrías buscar un canal de logs o administración
        }

        if (interaction.customId.startsWith("modal_rechazar_")) {
            const [, , orderId] = interaction.customId.split("_");
            const reason = interaction.fields.getTextInputValue("razon_rechazo");

            const order = await OrderSchema.findById(orderId);
            if (!order) {
                await interaction.reply({ content: "No se encontró la orden.", ephemeral: true });
                return;
            }

            order.status = "rechazada";
            order.rejectionReason = reason;
            await order.save();

            const embed = new EmbedBuilder()
                .setTitle("❌ Orden Rechazada")
                .setColor("Red")
                .setDescription(`La orden de **${order.userName}** ha sido rechazada.`)
                .addFields({ name: "Motivo", value: reason });

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Notificar al usuario (opcional)
            try {
                const user = await client.users.fetch(order.userId);
                await user.send({
                    content: `❌ Tu orden de cashback ha sido **rechazada**.\n**Motivo:** ${reason}`
                });
            } catch (err) {
                console.log(`No se pudo enviar MD al usuario ${order.userId}`);
            }
        }
    }
};
