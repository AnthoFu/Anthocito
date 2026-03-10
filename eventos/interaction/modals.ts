import { EmbedBuilder, Interaction, Client } from "discord.js";
import OrderSchema, { IOrder } from "../../models/OrderSchema";

export default {
    name: "interactionCreate",

    async execute(interaction: Interaction, client: Client) {
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

            let collaboratorId: string | null = null;
            let collaboratorName: string | null = null;

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
                    } catch (_e: unknown) {
                        console.error(`Error fetching collaborator user for ID ${collaboratorId}:`, _e);
                        collaboratorName = `ID: ${collaboratorId}`;
                    }
                }
            }

            const newOrder: IOrder = new OrderSchema({
                guildId: interaction.guild!.id,
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
                    { name: "ID de la Orden", value: `\`${newOrder._id}\``, inline: true },
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
            } catch (_err) {
                console.error(`No se pudo enviar MD al usuario ${order.userId}:`, _err);
            }
        }
        if (interaction.customId.startsWith("vouch_modal_")) {
            const orderId = interaction.customId.split("_")[2];
            const comentario =
                interaction.fields.getTextInputValue("vouch_comment") || "¡Pago recibido correctamente! Gracias.";

            const order = await OrderSchema.findOne({ _id: orderId, userId: interaction.user.id });

            if (!order) {
                await interaction.reply({
                    content: "No se encontró ninguna orden con ese ID o no te pertenece.",
                    ephemeral: true
                });
                return;
            }

            if (order.status !== "pagada") {
                await interaction.reply({
                    content: `Solo puedes hacer un vouch para órdenes con estado **PAGADA**. Estado actual: **${order.status}**.`,
                    ephemeral: true
                });
                return;
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
                    { name: "📝 Orden ID", value: `\`${order._id}\``, inline: true }
                )
                .setTimestamp()
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: "Gracias por confiar en nuestro servicio." });

            await interaction.reply({
                content: `🎉 ¡Gracias <@${interaction.user.id}> por tu confianza!`,
                embeds: [vouchEmbed]
            });
        }
    }
};
